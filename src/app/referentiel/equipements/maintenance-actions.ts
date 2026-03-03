"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEquipementsMaintenance() {
    return await prisma.equipementStockage.findMany({
        select: {
            id: true,
            nom: true,
            typeEquipement: true,
            dateDerniereMaintenance: true,
            dateProchaineMaintenance: true,
        },
        orderBy: {
            dateProchaineMaintenance: 'asc'
        }
    });
}

export async function getMaintenanceHistory(equipementId: number) {
    return await prisma.journalMaintenance.findMany({
        where: { equipementId },
        orderBy: { date: 'desc' }
    });
}

export async function recordMaintenance(data: {
    equipementId: number;
    date: Date;
    type: string;
    description?: string;
    intervenant?: string;
    cout?: number;
    prochaineDate?: Date;
}) {
    try {
        await prisma.$transaction([
            // Ajouter au journal
            prisma.journalMaintenance.create({
                data: {
                    equipementId: data.equipementId,
                    date: data.date,
                    type: data.type,
                    description: data.description,
                    intervenant: data.intervenant,
                    cout: data.cout,
                }
            }),
            // Mettre à jour l'équipement
            prisma.equipementStockage.update({
                where: { id: data.equipementId },
                data: {
                    dateDerniereMaintenance: data.date,
                    dateProchaineMaintenance: data.prochaineDate
                }
            })
        ]);

        revalidatePath("/referentiel/equipements/maintenance");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la maintenance:", error);
        return { success: false, error: "Erreur de sauvegarde" };
    }
}
