"use server";

import prisma from "@/lib/prisma";

export async function getSalesReportData() {
    try {
        const report = await prisma.avitaillement.findMany({
            include: {
                programmeVol: {
                    include: {
                        compagnie: true,
                        typeAvion: true,
                        aeroportDepart: true,
                        aeroportArrivee: true
                    }
                },
                camion: true
            },
            orderBy: { dateOperation: 'desc' }
        });

        return { report };
    } catch (error) {
        console.error("Erreur lors de la récupération du rapport de vente:", error);
        throw new Error("Impossible de charger les données du rapport.");
    }
}
