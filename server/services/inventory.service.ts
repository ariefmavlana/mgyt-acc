import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma'; // fix import path

export class InventoryService {

    /**
     * Add Stock (Purchase, Returns, Adjustment IN)
     */
    static async addStock(
        tx: Prisma.TransactionClient,
        data: {
            persediaanId: string;
            gudangId: string;
            qty: number;
            costPerUnit: number;
            refType: string;
            refId: string;
            tanggal: Date;
            keterangan?: string;
        }
    ) {
        // 1. Update StokPersediaan
        await tx.stokPersediaan.upsert({
            where: {
                persediaanId_gudangId: {
                    persediaanId: data.persediaanId,
                    gudangId: data.gudangId
                }
            },
            create: {
                persediaanId: data.persediaanId,
                gudangId: data.gudangId,
                kuantitas: data.qty,
                nilaiStok: data.qty * data.costPerUnit,
                hargaRataRata: data.costPerUnit
            },
            update: {
                kuantitas: { increment: data.qty },
                nilaiStok: { increment: data.qty * data.costPerUnit },
                // Recalculate Average Cost (Simplified)
                // In a true Moving Average system, we would recalc based on (OldValue + NewValue) / (OldQty + NewQty)
                // But since we are focusing on FIFO for valuation, we keep this for reference.
            }
        });

        // 2. Create InventoryLayer (FIFO Buffer)
        await tx.inventoryLayer.create({
            data: {
                persediaanId: data.persediaanId,
                gudangId: data.gudangId,
                kuantitasAwal: data.qty,
                kuantitasSisa: data.qty,
                hargaBeli: data.costPerUnit,
                tanggalMasuk: data.tanggal,
                referensiType: data.refType,
                referensiId: data.refId,
                batchNo: `BATCH-${Date.now()}` // Optional: proper batch tracking
            }
        });

        // 3. Log Mutation IN
        await tx.mutasiPersediaan.create({
            data: {
                persediaanId: data.persediaanId,
                gudangId: data.gudangId,
                nomorMutasi: `MUT-${Date.now()}`,
                tanggal: data.tanggal,
                tipe: data.refType === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'MASUK',
                kuantitas: data.qty,
                harga: data.costPerUnit,
                nilai: data.qty * data.costPerUnit,
                saldoSebelum: 0, // TODO: Fetch current balance if needed for accurate audit
                saldoSesudah: 0, // TODO: Calculate
                referensi: data.refId,
                keterangan: data.keterangan || `Penerimaan Stok (${data.refType})`
            }
        });
    }

    /**
     * Remove Stock (Sales, Usage, Adjustment OUT) - FIFO Strategy
     * Returns the TOTAL COGS (Cost of Goods Sold) for the removed items.
     */
    static async removeStock(
        tx: Prisma.TransactionClient,
        data: {
            persediaanId: string;
            gudangId: string;
            qty: number;
            refType: string;
            refId: string;
            tanggal: Date;
            keterangan?: string;
        }
    ): Promise<number> {
        let remainingQty = data.qty;
        let totalCost = 0;

        // 1. Get Available Layers (FIFO: Oldest First)
        const layers = await tx.inventoryLayer.findMany({
            where: {
                persediaanId: data.persediaanId,
                gudangId: data.gudangId,
                kuantitasSisa: { gt: 0 }
            },
            orderBy: { tanggalMasuk: 'asc' }
        });

        // 2. Consume Layers
        for (const layer of layers) {
            if (remainingQty <= 0) break;

            const available = Number(layer.kuantitasSisa);
            const toTake = Math.min(available, remainingQty);
            const cost = toTake * Number(layer.hargaBeli);

            totalCost += cost;
            remainingQty -= toTake;

            // Update Layer
            await tx.inventoryLayer.update({
                where: { id: layer.id },
                data: { kuantitasSisa: { decrement: toTake } }
            });
        }

        // Check if stock was sufficient
        if (remainingQty > 0) {
            // Option: Error out OR Allow negative stock (if policy permits).
            // For automation, usually we error out to prevent negative inventory issues.
            throw new Error(`Stok tidak mencukupi untuk Persediaan ID ${data.persediaanId}. Sisa permintaan: ${remainingQty}`);
        }

        // 3. Update StokPersediaan
        await tx.stokPersediaan.update({
            where: {
                persediaanId_gudangId: {
                    persediaanId: data.persediaanId,
                    gudangId: data.gudangId
                }
            },
            data: {
                kuantitas: { decrement: data.qty },
                nilaiStok: { decrement: totalCost }
            }
        });

        // 4. Log Mutation OUT
        await tx.mutasiPersediaan.create({
            data: {
                persediaanId: data.persediaanId,
                gudangId: data.gudangId,
                nomorMutasi: `MUT-${Date.now()}`,
                tanggal: data.tanggal,
                tipe: data.refType === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'KELUAR',
                kuantitas: data.qty,
                harga: totalCost / data.qty, // Avg cost for this transaction
                nilai: totalCost,
                saldoSebelum: 0,
                saldoSesudah: 0,
                referensi: data.refId,
                keterangan: data.keterangan || `Pengeluaran Stok (${data.refType})`
            }
        });

        return totalCost;
    }

    /**
     * Check Stock Alerts
     */
    static async checkLowStock(persediaanId: string, gudangId: string) {
        const stock = await prisma.stokPersediaan.findUnique({
            where: { persediaanId_gudangId: { persediaanId, gudangId } },
            include: { persediaan: true }
        });

        if (stock && Number(stock.kuantitas) <= Number(stock.persediaan.stokMinimum)) {
            // Trigger Notification (Email/In-App)
            // TODO: Call NotificationService
            console.log(`ALERT: Low Stock for ${stock.persediaan.namaPersediaan} in Warehouse ${gudangId}`);
        }
    }
}
