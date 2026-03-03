"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Compagnies Bulk
export async function bulkImportCompagnies(data: any[]) {
    try {
        await prisma.compagnie.createMany({
            data: data.map(item => ({
                nom: item.nom,
                codeIata: item.codeIata,
                codeIcao: item.codeIcao,
            })),
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/compagnies");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// Aeroports Bulk
export async function bulkImportAeroports(data: any[]) {
    try {
        await prisma.aeroport.createMany({
            data: data.map(item => ({
                nom: item.nom,
                codeIata: item.codeIata,
                codeIcao: item.codeIcao,
                ville: item.ville,
                pays: item.pays,
            })),
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/aeroports");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// Avions Bulk
export async function bulkImportAvions(data: any[]) {
    try {
        // Note: foreign keys (typeAvionId, compagnieId) must exist
        await prisma.avion.createMany({
            data: data.map(item => ({
                immatriculation: item.immatriculation,
                compagnieId: Number(item.compagnieId),
                typeAvionId: Number(item.typeAvionId),
            })),
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/avions");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// TypeAvion Bulk
export async function bulkImportTypeAvions(data: any[]) {
    try {
        await prisma.typeAvion.createMany({
            data: data.map(item => ({
                constructeur: item.constructeur,
                modele: item.modele,
                codeIata: item.codeIata,
                codeIcao: item.codeIcao,
                capaciteReservoir: Number(item.capaciteReservoir),
            })),
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/avions");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// Equipement Bulk
export async function bulkImportEquipements(data: any[]) {
    try {
        await prisma.equipementStockage.createMany({
            data: data.map(item => ({
                nom: item.nom,
                typeEquipement: item.typeEquipement,
                capaciteMaximale: Number(item.capaciteMaximale),
                stockInitial: Number(item.stockInitial),
                seuilAlerte: item.seuilAlerte ? Number(item.seuilAlerte) : undefined,
                actif: true
            })),
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/equipements");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}
