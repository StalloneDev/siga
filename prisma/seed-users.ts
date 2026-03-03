import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            nom: 'Utilisateur',
            prenom: 'utilisateur',
            profil: 'AVITAILLEUR',
            password: 'Avitailleur2026',
        },
        {
            nom: 'HOUENOU',
            prenom: 'Chadrac',
            profil: 'SUPERVISEUR',
            password: 'Superviseur@2026',
        },
        {
            nom: 'AGNOUN',
            prenom: 'Ulrich',
            profil: 'DIRECTEUR',
            password: 'Lead@2026',
        },
        {
            nom: 'KOUKPELOU',
            prenom: 'Stallone',
            profil: 'ADMINISTRATEUR',
            password: 'Corlay@2026',
        },
    ];

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await (prisma as any).utilisateur.upsert({
            where: { email: `${u.prenom.toLowerCase()}.${u.nom.toLowerCase()}@mrsholdings.com` },
            update: {},
            create: {
                nom: u.nom,
                prenom: u.prenom,
                email: `${u.prenom.toLowerCase()}.${u.nom.toLowerCase()}@mrsholdings.com`,
                password: hashedPassword,
                profil: u.profil,
            },
        });
        console.log(`User ${u.prenom} ${u.nom} created/updated.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
