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
        // @ts-ignore - perusahaanId still exists in DB but might be hidden by Prisma Client if I run generate without it
        // However, I kept it in schema temporarily, so it should be there.
        const perusahaanId = (user as any).perusahaanId;
        const cabangId = (user as any).cabangId;
        const role = (user as any).role;

        if (perusahaanId) {
            console.log(`Migrating user ${user.username} to company ${perusahaanId}...`);
            await prisma.aksesPengguna.create({
                data: {
                    penggunaId: user.id,
                    perusahaanId: perusahaanId,
                    cabangId: cabangId,
                    role: role,
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
