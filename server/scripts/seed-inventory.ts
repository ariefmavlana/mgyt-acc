import 'dotenv/config';
import prisma from '../../lib/prisma';

async function main() {
    console.log('Starting seed-inventory script...');

    // 1. Get first company and branch
    const access = await prisma.aksesPengguna.findFirst({
        include: { perusahaan: true, cabang: true }
    });

    if (!access || !access.perusahaanId) {
        console.error('No company access found');
        return;
    }

    const perusahaanId = access.perusahaanId;
    let cabangId = access.cabangId;

    if (!cabangId) {
        console.log('No branch found, creating default branch...');
        const branch = await prisma.cabang.create({
            data: {
                perusahaanId,
                kode: 'BR-01',
                nama: 'Kantor Pusat',
                isKantor: true,
                isAktif: true
            }
        });
        cabangId = branch.id;
    }

    console.log(`Seeding for Company: ${access.perusahaan.nama} (${perusahaanId}), Branch ID: ${cabangId}`);

    // 2. Create Warehouse
    const warehouse = await prisma.gudang.upsert({
        where: { cabangId_kode: { cabangId, kode: 'GP-01' } },
        update: {},
        create: {
            cabangId,
            kode: 'GP-01',
            nama: 'Gudang Pusat',
            alamat: 'Kawasan Industri Bekasi',
            penanggungJawab: 'Ahmad',
            isUtama: true
        }
    });

    console.log(`Warehouse created/found: ${warehouse.nama} (ID: ${warehouse.id})`);

    // 3. Create Product
    const productKode = 'STR-01';
    const existingProduct = await prisma.produk.findFirst({
        where: { perusahaanId, kodeProduk: productKode }
    });

    if (!existingProduct) {
        const result = await prisma.$transaction(async (tx) => {
            const persediaan = await tx.persediaan.create({
                data: {
                    perusahaanId,
                    kodePersediaan: productKode,
                    namaPersediaan: 'Semen Tiga Roda',
                    kategori: 'Material Bangunan',
                    satuan: 'sak',
                    hargaJual: 65000,
                    hargaBeli: 58000,
                    stokMinimum: 10,
                }
            });

            const product = await tx.produk.create({
                data: {
                    perusahaanId,
                    persediaanId: persediaan.id,
                    kodeProduk: productKode,
                    namaProduk: 'Semen Tiga Roda',
                    kategori: 'Material Bangunan',
                    hargaJualEceran: 65000,
                    hargaBeli: 58000,
                    satuan: 'sak',
                }
            });
            return product;
        });
        console.log(`Product created: Semen Tiga Roda (ID: ${result.id})`);
    } else {
        console.log('Product already exists: Semen Tiga Roda');
    }

    console.log('Seed-inventory completed successfully.');
}

main()
    .catch(e => {
        console.error('Seed-inventory failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
