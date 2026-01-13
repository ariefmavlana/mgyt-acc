import 'dotenv/config';
import prisma from '../../lib/prisma';
import { InventoryService } from '../services/inventory.service';
import { Prisma } from '@prisma/client';

async function main() {
    console.log('Starting Stock Transfer Simulation...');

    // 1. Setup Context (Company, Branch)
    const access = await prisma.aksesPengguna.findFirst({
        include: { perusahaan: true, cabang: true }
    });

    if (!access || !access.perusahaanId) {
        throw new Error('No company access found. Please login/seed first.');
    }

    const perusahaanId = access.perusahaanId;


    // Find a valid branch or create one
    let branch = await prisma.cabang.findFirst({ where: { perusahaanId } });
    if (!branch) {
        branch = await prisma.cabang.create({
            data: {
                perusahaanId,
                kode: 'TEST-BR',
                nama: 'Test Branch',
                isKantor: true,
                isAktif: true
            }
        });
        console.log('Created Default Branch');
    }

    const cabangId = branch.id;
    console.log(`Context: Company ${access.perusahaan.nama}`);

    // 2. Setup Warehouses (Source & Target)
    const sourceWarehouse = await prisma.gudang.upsert({
        where: { cabangId_kode: { cabangId, kode: 'WH-SRC' } },
        update: {},
        create: {
            cabangId,
            kode: 'WH-SRC',
            nama: 'Gudang Sumber Test',
            alamat: 'Test Address 1',
            isUtama: false
        }
    });

    const targetWarehouse = await prisma.gudang.upsert({
        where: { cabangId_kode: { cabangId, kode: 'WH-TGT' } },
        update: {},
        create: {
            cabangId,
            kode: 'WH-TGT',
            nama: 'Gudang Tujuan Test',
            alamat: 'Test Address 2',
            isUtama: false
        }
    });

    console.log(`Warehouses: ${sourceWarehouse.nama} -> ${targetWarehouse.nama}`);

    // 3. Setup Product
    const productCode = 'TEST-PROD-X';
    let persediaan = await prisma.persediaan.findFirst({
        where: { perusahaanId, kodePersediaan: productCode }
    });

    if (!persediaan) {
        persediaan = await prisma.persediaan.create({
            data: {
                perusahaanId,
                kodePersediaan: productCode,
                namaPersediaan: 'Test Transfer Item',
                kategori: 'General',
                satuan: 'pcs',
                hargaBeli: 5000,
                hargaJual: 10000,
                status: 'TERSEDIA'
            }
        });
        console.log('Created Test Product');
    }

    // 4. Initial Stock Setup (Properly via Service)
    console.log('Initializing Stock via InventoryService...');

    // Check valid FIFO layers
    const layerAgg = await prisma.inventoryLayer.aggregate({
        where: { persediaanId: persediaan.id, gudangId: sourceWarehouse.id, kuantitasSisa: { gt: 0 } },
        _sum: { kuantitasSisa: true }
    });

    const validStock = Number(layerAgg._sum.kuantitasSisa || 0);
    console.log(`Valid FIFO Stock: ${validStock}`);

    if (validStock < 100) {
        try {
            await prisma.$transaction(async (tx) => {
                await InventoryService.addStock(tx as Prisma.TransactionClient, {
                    persediaanId: persediaan!.id,
                    gudangId: sourceWarehouse.id,
                    qty: 100,
                    costPerUnit: 5000,
                    refType: 'SETUP',
                    refId: `SETUP-${Date.now()}`,
                    tanggal: new Date(),
                    keterangan: 'Initial Setup'
                });
            });
            console.log('Stock Initialized (100 units)');
        } catch (e) {
            console.error('Setup Failed:', e);
        }
    }

    // Ensure Target has 0 (or we just accept whatever is there, checking delta is better)
    const initialTarget = await prisma.stokPersediaan.findUnique({
        where: { persediaanId_gudangId: { persediaanId: persediaan.id, gudangId: targetWarehouse.id } }
    });
    const startTargetQty = Number(initialTarget?.kuantitas || 0);
    const startSourceQty = Number((await prisma.stokPersediaan.findUnique({
        where: { persediaanId_gudangId: { persediaanId: persediaan.id, gudangId: sourceWarehouse.id } }
    }))?.kuantitas || 0);

    console.log(`Initial State: Source=${startSourceQty}, Target=${startTargetQty}`);

    // 5. Execute Transfer Logic (The Core Test)
    const transferQty = 10;
    console.log(`Executing Transfer of ${transferQty} units...`);

    try {
        await prisma.$transaction(async (tx) => {
            // Remove from Source
            await InventoryService.removeStock(tx as Prisma.TransactionClient, {
                persediaanId: persediaan!.id,
                gudangId: sourceWarehouse.id,
                qty: transferQty,
                refType: 'TRANSFER_OUT',
                refId: `TEST-${Date.now()}`,
                tanggal: new Date(),
                keterangan: 'Simulation Test'
            });

            // Add to Target
            await InventoryService.addStock(tx as Prisma.TransactionClient, {
                persediaanId: persediaan!.id,
                gudangId: targetWarehouse.id,
                qty: transferQty,
                costPerUnit: Number(persediaan!.hargaBeli),
                refType: 'TRANSFER_IN',
                refId: `TEST-${Date.now()}`,
                tanggal: new Date(),
                keterangan: 'Simulation Test'
            });
        });
        console.log('Transaction Success!');
    } catch (e) {
        console.error('Transaction Failed:', e);
        process.exit(1);
    }

    // 6. Verify Results
    const finalSource = await prisma.stokPersediaan.findUnique({
        where: { persediaanId_gudangId: { persediaanId: persediaan.id, gudangId: sourceWarehouse.id } }
    });

    const finalTarget = await prisma.stokPersediaan.findUnique({
        where: { persediaanId_gudangId: { persediaanId: persediaan.id, gudangId: targetWarehouse.id } }
    });

    console.log(`Final State: Source=${finalSource?.kuantitas}, Target=${finalTarget?.kuantitas}`);

    // Delta check is more robust than absolute check
    const diffSource = startSourceQty - Number(finalSource?.kuantitas || 0);
    const diffTarget = Number(finalTarget?.kuantitas || 0) - startTargetQty;

    // Verify Value Transfer
    const targetLayer = await prisma.inventoryLayer.findFirst({
        where: { persediaanId: persediaan.id, gudangId: targetWarehouse.id, kuantitasSisa: { gt: 0 } }
    });

    console.log(`Target Layer Cost: ${targetLayer?.hargaBeli}`);

    if (diffSource === transferQty && diffTarget === transferQty) {
        if (Number(targetLayer?.hargaBeli) === 5000) {
            console.log('✅ TEST PASSED: Stock moved correctly with correct FIFO value (5000).');
        } else {
            console.error(`❌ TEST FAILED: Value Mismatch. Expected 5000, got ${targetLayer?.hargaBeli}`);
        }
    } else {
        console.error(`❌ TEST FAILED: Stock mismatch. Source -${diffSource}, Target +${diffTarget}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
