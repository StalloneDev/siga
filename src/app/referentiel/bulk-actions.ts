"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Compagnies Bulk
export async function bulkImportCompagnies(data: any[]) {
    try {
        await prisma.compagnieAerienne.createMany({
            data: data.map(item => ({
                nom: item.nom || item.Nom || "",
                codeIata: item.codeIata || item['Code IATA'] || item.code_iata || "",
                codeIcao: item.codeIcao || item['Code ICAO'] || item.code_icao || "",
                pays: item.pays || item.Pays || "Benin", // Default if missing, but should be in Excel
                actif: item.Status === "Inactif" ? false : true,
            })).filter(item => item.nom && item.codeIata), // Basic validation
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
                nom: item.nom || item.Nom || "",
                codeIata: item.codeIata || item['Code IATA'] || item.code_iata || "",
                codeIcao: item.codeIcao || item['Code ICAO'] || item.code_icao || "",
                ville: item.ville || item.Ville || "",
                pays: item.pays || item.Pays || "",
            })).filter(item => item.nom && item.codeIata), // Basic validation
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/aeroports");
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
                constructeur: item.constructeur || item.Constructeur || "",
                modele: item.modele || item.Modele || item.Modèle || "",
                codeIata: item.codeIata || item['Code IATA'] || item.code_iata || "",
                codeIcao: item.codeIcao || item['Code ICAO'] || item.code_icao || "",
                capaciteReservoir: Number(item.capaciteReservoir || item['Capacité Réservoir'] || 0),
            })).filter(item => item.constructeur && item.modele && item.codeIata),
            skipDuplicates: true,
        });
        // revalidatePath("/referentiel/avions"); // Removed since page is gone
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
                nom: item.nom || item.Nom || "",
                typeEquipement: item.typeEquipement || item.Type || "BAC", // Defaults to BAC
                capaciteMaximale: Number(item.capaciteMaximale || item['Capacité Maximale (L)'] || 0),
                stockInitial: Number(item.stockInitial || item['Stock Initial (L)'] || 0),
                seuilAlerte: item.seuilAlerte || item['Seuil Alerte'] ? Number(item.seuilAlerte || item['Seuil Alerte']) : undefined,
                actif: true
            })).filter(item => item.nom && item.capaciteMaximale > 0), // Basic validation
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/equipements");
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}
