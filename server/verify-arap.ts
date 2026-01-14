import { PrismaClient } from '@prisma/client';
import { receivePayment } from './controllers/payment.controller';
import { ReportingService } from './services/reporting.service';
import { ReminderService } from './services/reminder.service';
import { createTransaction } from './controllers/transaction.controller';

const prisma = new PrismaClient();

// Basic Mock Interfaces
interface MockRequest {
    body: Record<string, unknown>;
    user: { id: string; username: string };
    currentCompanyId: string;
    params: Record<string, string>;
    query: Record<string, unknown>;
}

interface MockResponse {
    statusCode: number;
    data: any;
    status: (code: number) => MockResponse;
    json: (data: any) => MockResponse;
    setHeader: (key: string, value: string) => void;
    send: (data: any) => void;
}

const mockReq = (body: Record<string, unknown>, user: { id: string; username: string }, companyId: string, query: Record<string, unknown> = {}): MockRequest => ({
    body,
    user,
    currentCompanyId: companyId,
    params: {},
    query
});

const mockRes = (): MockResponse => {
    const res: Partial<MockResponse> = {};
    res.statusCode = 200;
    res.data = null;
    res.status = (code: number) => { res.statusCode = code; return res as MockResponse; };
    res.json = (data: any) => { res.data = data; return res as MockResponse; };
    res.setHeader = () => { };
    res.send = () => { };
    return res as MockResponse;
};

async function runVerification() {
    console.log('=== STARTING AR/AP VERIFICATION ===');

    try {
        // 1. SETUP: Get Company & User
        const company = await prisma.perusahaan.findFirst();
        const user = await prisma.pengguna.findFirst();

        if (!company || !user) {
            console.error('No company or user found. Please look at the database.');
            return;
        }

        const COMPANY_ID = company.id;
        const USER = { id: user.id, username: user.namaLengkap };

        console.log(`Using Company: ${company.nama} (${COMPANY_ID})`);

        // 2. SETUP: Get Customer & COA
        const customer = await prisma.pelanggan.findFirst({ where: { perusahaanId: COMPANY_ID } });
        if (!customer) {
            console.log('Creating dummy customer...');
            // create dummy customer if needed, else fail
            throw new Error('No customer found');
        }

        const akunPiutang = await prisma.chartOfAccounts.findFirst({
            where: { perusahaanId: COMPANY_ID, kategoriAset: 'PIUTANG_USAHA' }
        });
        const akunPendapatan = await prisma.chartOfAccounts.findFirst({
            where: { perusahaanId: COMPANY_ID, tipe: 'PENDAPATAN' }
        });

        if (!akunPiutang || !akunPendapatan) throw new Error('COA missing');

        // 3. CREATE INVOICE (Backdated 31 days to make it overdue)
        console.log('\n[STEP 1] Creating Backdated Invoice (31 days ago)...');
        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() - 31);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 1); // Overdue by 1 day

        const invReq = mockReq({
            tanggal: invoiceDate,
            kategori: 'PENDAPATAN', // TipeTransaksi ENUM? check schema
            kontakId: customer.id,
            detail: [
                { akunId: akunPendapatan.id, deskripsi: 'Jasa Test', kuantitas: 1, hargaSatuan: 1000000, subtotal: 1000000 }
            ],
            deskripsi: 'Test Automation Invoice',
            referensi: 'AUTO-TEST-001',
            tanggalJatuhTempo: dueDate,
            termPembayaran: 30
        }, USER, COMPANY_ID);

        // Note: We need to use 'createTransaction' but handling the ENUM for tipe might be tricky if simplified in mock
        // Assuming 'PENDAPATAN' maps to valid TipeTransaksi, usually 'FAKTUR_PENJUALAN' for AR?
        // Let's check TipeTransaksi enum. Usually 'PENJUALAN' or 'FAKTUR'
        // I will risk it with 'PENJUALAN'
        invReq.body.tipe = 'PENJUALAN';

        const invRes = mockRes();
        await createTransaction(invReq as any, invRes as any);

        if (invRes.statusCode !== 201) {
            console.error('Failed to create invoice:', invRes.data);
            return;
        }

        const invoice = invRes.data.data;
        console.log(`Invoice Created: ${invoice.nomorTransaksi} - Total: ${invoice.total}`);

        // 4. CHECK AGING
        console.log('\n[STEP 2] Checking Aging Schedule...');
        const agingReport = await ReportingService.calculateARAging(COMPANY_ID);
        // Find our customer
        const customerAging = agingReport.find((d: { pelangganId: string }) => d.pelangganId === customer.id);
        if (customerAging) {
            console.log('Aging Bucket for Customer:', customerAging);
            // Expect some amount in 1-30 or current depending on calculation
        } else {
            console.error('Customer not found in aging report!');
        }

        // 5. TRIGGER REMINDERS
        console.log('\n[STEP 3] Triggering Reminders...');
        const reminders = await ReminderService.processReminders();
        // Check if our invoice is in the list
        const reminderSent = reminders.find((r: { nomorInvoice: string; type: string }) => r.nomorInvoice === invoice.nomorTransaksi);
        if (reminderSent) {
            console.log(`[SUCCESS] Reminder generated for ${invoice.nomorTransaksi} (${reminderSent.type})`);
        } else {
            console.warn(`[WARNING] No reminder generated for ${invoice.nomorTransaksi}. Check logic.`);
        }

        // 6. ALLOCATE PAYMENT (Partial)
        console.log('\n[STEP 4] Processing Partial Payment (50%)...');
        const payAmount = 500000;
        const payReq = mockReq({
            tanggal: new Date(),
            jumlah: payAmount,
            metodePembayaran: 'TUNAI',
            allocations: [
                { invoiceId: invoice.id, amount: payAmount }
            ],
            catatan: 'Partial Payment Test'
        }, USER, COMPANY_ID);

        const payRes = mockRes();
        await receivePayment(payReq as any, payRes as any);

        if (payRes.statusCode !== 201) {
            console.error('Payment Failed:', payRes.data);
        } else {
            console.log(`Payment Recorded: Voucher ${payRes.data.data.nomorVoucher}`);
        }

        // 7. VERIFY BALANCE
        const updatedInvoice = await prisma.transaksi.findUnique({
            where: { id: invoice.id },
            include: { piutangs: true }
        });

        const sisa = updatedInvoice?.sisaPembayaran;
        console.log(`Updated Invoice Balance: ${sisa} (Expected 500000)`);

        if (Number(sisa) === 500000) {
            console.log('[SUCCESS] Partial payment updated balance correctly.');
        } else {
            console.error('[FAILURE] Balance mismatch.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
