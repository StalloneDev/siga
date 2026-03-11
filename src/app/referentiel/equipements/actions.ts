"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EquipementType } from "@prisma/client";

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
        revalidatePath("/referentiel/equipements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création de l'équipement" };
    }
}

export async function deleteEquipement(id: number) {
    try {
        await prisma.equipementStockage.delete({ where: { id } });
        revalidatePath("/referentiel/equipements");
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
        revalidatePath("/referentiel/equipements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour de l'équipement" };
    }
}
