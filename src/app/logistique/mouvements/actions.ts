"use server";

import prisma from "@/lib/prisma";

export async function getMouvements(limit = 100) {
    return await prisma.mouvementStock.findMany({
        include: { equipement: true },
        orderBy: { dateMouvement: "desc" },
        take: limit,
    });
}

export async function getStockActuel() {
    // Calculate current stock for each equipment by summing all movements
    const equipements = await prisma.equipementStockage.findMany({
        where: { actif: true },
        include: {
            mouvements: true,
        },
        orderBy: { nom: "asc" },
    });

    return equipements.map(eq => {
        const stockBase = eq.stockInitial;
        const stockDelta = eq.mouvements.reduce((sum: number, m: { typeMouvement: string; quantite: number }) => {
            if (m.typeMouvement === "RECEPTION" || m.typeMouvement === "TRANSFERT_ENTREE" || m.typeMouvement === "AJUSTEMENT") {
                return sum + m.quantite;
            } else {
                return sum - m.quantite;
            }
        }, 0);

        return {
            id: eq.id,
            nom: eq.nom,
            typeEquipement: eq.typeEquipement,
            capaciteMaximale: eq.capaciteMaximale,
            stockActuel: stockBase + stockDelta,
        };
    });
}
