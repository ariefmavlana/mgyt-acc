import 'dotenv/config';
import prisma from '../../lib/prisma';

async function main() {
    console.log('--- Starting Tenant Migration ---');

    const users = await prisma.pengguna.findMany({
        where: {
            aksesPerusahaan: {
                none: {}
            }
        }
    });

    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
        const perusahaanId = (user as { perusahaanId?: string }).perusahaanId;
        const cabangId = (user as { cabangId?: string }).cabangId;
        const role = (user as { role?: any }).role;

        if (perusahaanId) {
            console.log(`Migrating user ${user.username} to company ${perusahaanId}...`);
            await prisma.aksesPengguna.create({
                data: {
                    penggunaId: user.id,
                    perusahaanId: perusahaanId,
                    cabangId: cabangId,
                    roleEnum: role as any,
                    isDefault: true,
                    isAktif: true
                }
            });
        }
    }

    console.log('--- Migration Completed ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
