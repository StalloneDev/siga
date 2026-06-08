"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EquipementType } from "@prisma/client";

/**
 * Invalide le cache de toutes les pages qui dépendent des données de stock.
 * À appeler après toute création, modification ou suppression d'un équipement,
 * car le stockInitial est utilisé comme base de calcul du stock actuel.
 */
function revalidateAllStockPages() {
    revalidatePath("/");                          // Tableau de bord (Prévisions de Stock)
    revalidatePath("/analyse");                   // Analyse & Performance (Stock Total BACs)
    revalidatePath("/logistique");                // Logistique
    revalidatePath("/logistique/mouvements");     // Journal des mouvements
    revalidatePath("/logistique/reception");      // Réceptions
    revalidatePath("/logistique/transfert");      // Transferts
    revalidatePath("/referentiel/equipements");   // Page équipements elle-même
}

export async function getEquipements() {
    return await prisma.equipementStockage.findMany({
        orderBy: { nom: "asc" },
    });
}

export async function createEquipement(data: {
    nom: string;
    typeEquipement: EquipementType;
    capaciteMaximale: number;
    stockInitial: number;
    seuilAlerte: number;
}) {
    try {
        await prisma.equipementStockage.create({ data });
        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création de l'équipement" };
    }
}

export async function deleteEquipement(id: number) {
    try {
        await prisma.equipementStockage.delete({ where: { id } });
        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" };
    }
}

export async function updateEquipement(id: number, data: {
    nom: string;
    typeEquipement: EquipementType;
    capaciteMaximale: number;
    stockInitial: number;
    seuilAlerte: number;
}) {
    try {
        await prisma.equipementStockage.update({
            where: { id },
            data
        });
        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour de l'équipement" };
    }
}
