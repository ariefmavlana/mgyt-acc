import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma'; // fix import path

export class InventoryService {

    /**
     * Add Stock (Purchase, Returns, Adjustment IN)
     */
    /**
     * Batch Add Stock
     */
    static async batchAddStock(
        tx: Prisma.TransactionClient,
        items: {
            persediaanId: string;
            gudangId: string;
            qty: number;
            costPerUnit: number;
        }[],
        data: {
            refType: string;
            refId: string;
            tanggal: Date;
            keterangan?: string;
        }
    ) {
        for (const item of items) {
            const currentStock = await tx.stokPersediaan.findUnique({
                where: {
                    persediaanId_gudangId: {
                        persediaanId: item.persediaanId,
                        gudangId: item.gudangId
                    }
                }
            });

            const saldoSebelum = currentStock ? Number(currentStock.kuantitas) : 0;
            const saldoSesudah = saldoSebelum + item.qty;

            await tx.stokPersediaan.upsert({
                where: {
                    persediaanId_gudangId: {
                        persediaanId: item.persediaanId,
                        gudangId: item.gudangId
                    }
                },
                create: {
                    persediaanId: item.persediaanId,
                    gudangId: item.gudangId,
                    kuantitas: item.qty,
                    nilaiStok: item.qty * item.costPerUnit,
                    hargaRataRata: item.costPerUnit
                },
                update: {
                    kuantitas: { increment: item.qty },
                    nilaiStok: { increment: item.qty * item.costPerUnit },
                }
            });

            await tx.inventoryLayer.create({
                data: {
                    persediaanId: item.persediaanId,
                    gudangId: item.gudangId,
                    kuantitasAwal: item.qty,
                    kuantitasSisa: item.qty,
                    hargaBeli: item.costPerUnit,
                    tanggalMasuk: data.tanggal,
                    referensiType: data.refType,
                    referensiId: data.refId,
                    batchNo: `BATCH-${Date.now()}-${Math.random().toString(36).slice(-4)}`
                }
            });

            await tx.mutasiPersediaan.create({
                data: {
                    persediaanId: item.persediaanId,
                    gudangId: item.gudangId,
                    nomorMutasi: `MUT-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
                    tanggal: data.tanggal,
                    tipe: data.refType === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'MASUK',
                    kuantitas: item.qty,
                    harga: item.costPerUnit,
                    nilai: item.qty * item.costPerUnit,
                    saldoSebelum,
                    saldoSesudah,
                    referensi: data.refId,
                    keterangan: data.keterangan || `Penerimaan Stok (${data.refType})`
                }
            });
        }
    }

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
        await this.batchAddStock(tx, [{
            persediaanId: data.persediaanId,
            gudangId: data.gudangId,
            qty: data.qty,
            costPerUnit: data.costPerUnit
        }], {
            refType: data.refType,
            refId: data.refId,
            tanggal: data.tanggal,
            keterangan: data.keterangan
        });
    }

    /**
     * Remove Stock (Sales, Usage, Adjustment OUT) - FIFO Strategy
     * Returns the TOTAL COGS (Cost of Goods Sold) for the removed items.
     */
    /**
     * Batch Remove Stock (FIFO Strategy)
     * Processes multiple items to reduce database round-trips.
     */
    static async batchRemoveStock(
        tx: Prisma.TransactionClient,
        items: {
            persediaanId: string;
            gudangId: string;
            qty: number;
        }[],
        data: {
            refType: string;
            refId: string;
            tanggal: Date;
            keterangan?: string;
        }
    ): Promise<Record<string, number>> {
        const cogsResults: Record<string, number> = {};

        for (const item of items) {
            let remainingQty = item.qty;
            let totalCost = 0;

            const layers = await tx.inventoryLayer.findMany({
                where: {
                    persediaanId: item.persediaanId,
                    gudangId: item.gudangId,
                    kuantitasSisa: { gt: 0 }
                },
                orderBy: { tanggalMasuk: 'asc' }
            });

            for (const layer of layers) {
                if (remainingQty <= 0) break;
                const available = Number(layer.kuantitasSisa);
                const toTake = Math.min(available, remainingQty);
                const cost = toTake * Number(layer.hargaBeli);

                totalCost += cost;
                remainingQty -= toTake;

                await tx.inventoryLayer.update({
                    where: { id: layer.id },
                    data: { kuantitasSisa: { decrement: toTake } }
                });
            }

            if (remainingQty > 0) {
                throw new Error(`Stok tidak mencukupi untuk Persediaan ID ${item.persediaanId}. Sisa permintaan: ${remainingQty}`);
            }

            const currentStock = await tx.stokPersediaan.findUnique({
                where: {
                    persediaanId_gudangId: {
                        persediaanId: item.persediaanId,
                        gudangId: item.gudangId
                    }
                }
            });

            const saldoSebelum = currentStock ? Number(currentStock.kuantitas) : 0;
            const saldoSesudah = saldoSebelum - item.qty;

            await tx.stokPersediaan.update({
                where: {
                    persediaanId_gudangId: {
                        persediaanId: item.persediaanId,
                        gudangId: item.gudangId
                    }
                },
                data: {
                    kuantitas: { decrement: item.qty },
                    nilaiStok: { decrement: totalCost }
                }
            });

            await tx.mutasiPersediaan.create({
                data: {
                    persediaanId: item.persediaanId,
                    gudangId: item.gudangId,
                    nomorMutasi: `MUT-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
                    tanggal: data.tanggal,
                    tipe: data.refType === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'KELUAR',
                    kuantitas: item.qty,
                    harga: totalCost / item.qty,
                    nilai: totalCost,
                    saldoSebelum,
                    saldoSesudah,
                    referensi: data.refId,
                    keterangan: data.keterangan || `Pengeluaran Stok (${data.refType})`
                }
            });

            cogsResults[`${item.persediaanId}_${item.gudangId}`] = totalCost;
        }

        return cogsResults;
    }

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
        const results = await this.batchRemoveStock(tx, [{
            persediaanId: data.persediaanId,
            gudangId: data.gudangId,
            qty: data.qty
        }], {
            refType: data.refType,
            refId: data.refId,
            tanggal: data.tanggal,
            keterangan: data.keterangan
        });

        return results[`${data.persediaanId}_${data.gudangId}`];
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
