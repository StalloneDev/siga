"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

function logDebug(msg: string, data?: any) {
    const logPath = "C:\\Users\\skoukpelou\\Downloads\\My app\\import-debug.log";
    const timestamp = new Date().toISOString();
    const content = `${timestamp} - ${msg} ${data ? JSON.stringify(data, null, 2) : ""}\n`;
    fs.appendFileSync(logPath, content);
}

function getValue(item: any, possibleKeys: string[]) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const itemKeys = Object.keys(item);
    const normalizedPossibleKeys = possibleKeys.map(normalize);

    for (const iKey of itemKeys) {
        const niKey = normalize(iKey);
        if (normalizedPossibleKeys.includes(niKey)) {
            return item[iKey];
        }
    }
    return undefined;
}

// Compagnies Bulk
export async function bulkImportCompagnies(data: any[]) {
    try {
        logDebug("Importing Compagnies, count:", data.length);
        if (data.length > 0) logDebug("Sample item keys:", Object.keys(data[0]));

        const mappedData = data.map(item => {
            const nom = getValue(item, ["nom", "Nom", "Name"]);
            const iata = getValue(item, ["codeIata", "Code IATA", "IATA", "code_iata"]);
            const icao = getValue(item, ["codeIcao", "Code ICAO", "ICAO", "code_icao"]);
            const pays = getValue(item, ["pays", "Pays", "Country"]);
            const status = getValue(item, ["Status", "actif", "Actif"]);

            return {
                nom: nom ? String(nom).trim() : "",
                codeIata: iata ? String(iata).trim().toUpperCase() : "",
                codeIcao: icao ? String(icao).trim().toUpperCase() : "",
                pays: pays ? String(pays).trim() : "Benin",
                actif: status === "Inactif" ? false : true,
            };
        }).filter(item => item.nom && item.codeIata);
        
        logDebug("Mapped data count for insertion:", mappedData.length);
        if (mappedData.length > 0) logDebug("First mapped item:", mappedData[0]);

        if (mappedData.length === 0) {
            return { success: true, count: 0, total: data.length };
        }

        const result = await prisma.compagnieAerienne.createMany({
            data: mappedData,
            skipDuplicates: true,
        });
        
        logDebug("Prisma result count:", result.count);
        revalidatePath("/referentiel/compagnies");
        return { success: true, count: result.count, total: data.length };
    } catch (e) {
        logDebug("Bulk import error (Compagnies):", String(e));
        return { success: false, error: String(e) };
    }
}

// Aeroports Bulk
export async function bulkImportAeroports(data: any[]) {
    try {
        logDebug("Importing Aeroports, count:", data.length);
        const mappedData = data.map(item => {
            const nom = getValue(item, ["nom", "Nom", "Name"]);
            const iata = getValue(item, ["codeIata", "Code IATA", "IATA", "code_iata"]);
            const icao = getValue(item, ["codeIcao", "Code ICAO", "ICAO", "code_icao"]);
            const ville = getValue(item, ["ville", "Ville", "City"]);
            const pays = getValue(item, ["pays", "Pays", "Country"]);

            return {
                nom: nom ? String(nom).trim() : "",
                codeIata: iata ? String(iata).trim().toUpperCase() : "",
                codeIcao: icao ? String(icao).trim().toUpperCase() : "",
                ville: ville ? String(ville).trim() : "",
                pays: pays ? String(pays).trim() : "",
            };
        }).filter(item => item.nom && item.codeIata);

        logDebug("Mapped data count for insertion:", mappedData.length);

        if (mappedData.length === 0) {
            return { success: true, count: 0, total: data.length };
        }

        const result = await prisma.aeroport.createMany({
            data: mappedData,
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/aeroports");
        return { success: true, count: result.count, total: data.length };
    } catch (e) {
        logDebug("Bulk import error (Aeroports):", String(e));
        return { success: false, error: String(e) };
    }
}

// TypeAvion Bulk
export async function bulkImportTypeAvions(data: any[]) {
    try {
        const mappedData = data.map(item => {
            const constructeur = getValue(item, ["constructeur", "Constructeur", "Manufacturer"]);
            const modele = getValue(item, ["modele", "Modele", "Modèle", "Model"]);
            const iata = getValue(item, ["codeIata", "Code IATA", "IATA", "code_iata"]);
            const icao = getValue(item, ["codeIcao", "Code ICAO", "ICAO", "code_icao"]);
            const cap = getValue(item, ["capaciteReservoir", "Capacité Réservoir", "Capacity", "Capacité Maximale (L)"]);

            return {
                constructeur: constructeur ? String(constructeur).trim() : "",
                modele: modele ? String(modele).trim() : "",
                codeIata: iata ? String(iata).trim().toUpperCase() : "",
                codeIcao: icao ? String(icao).trim().toUpperCase() : "",
                capaciteReservoir: Number(cap || 0),
            };
        }).filter(item => item.constructeur && item.modele && item.codeIata);

        if (mappedData.length === 0) {
            return { success: true, count: 0, total: data.length };
        }

        const result = await prisma.typeAvion.createMany({
            data: mappedData,
            skipDuplicates: true,
        });
        return { success: true, count: result.count, total: data.length };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// Equipement Bulk
export async function bulkImportEquipements(data: any[]) {
    try {
        logDebug("Importing Equipements, count:", data.length);
        if (data.length > 0) logDebug("Sample Equipement keys:", Object.keys(data[0]));
        const mappedData = data.map(item => {
            const nom = getValue(item, ["nom", "Nom", "Name"]);
            const typeRaw = getValue(item, ["typeEquipement", "Type", "TypeEquipement"]);
            const cap = getValue(item, ["capaciteMaximale", "Capacité Maximale (L)", "Capacite"]);
            const stock = getValue(item, ["stockInitial", "Stock Initial (L)", "Stock"]);
            const seuil = getValue(item, ["seuilAlerte", "Seuil Alerte"]);

            let type: "BAC" | "CAMION" = "BAC";
            if (typeRaw) {
                const t = String(typeRaw).toUpperCase().trim();
                if (t === "CAMION" || t === "BAC") {
                    type = t;
                }
            }

            return {
                nom: nom ? String(nom).trim() : "",
                typeEquipement: type,
                capaciteMaximale: Number(cap || 0),
                stockInitial: Number(stock || 0),
                seuilAlerte: seuil ? Number(seuil) : 0,
                actif: true
            };
        }).filter(item => item.nom && item.capaciteMaximale > 0);

        logDebug("Mapped data count for insertion:", mappedData.length);

        if (mappedData.length === 0) {
            return { success: true, count: 0, total: data.length };
        }

        const result = await prisma.equipementStockage.createMany({
            data: mappedData,
            skipDuplicates: true,
        });
        revalidatePath("/referentiel/equipements");
        return { success: true, count: result.count, total: data.length };
    } catch (e) {
        logDebug("Bulk import error (Equipements):", String(e));
        return { success: false, error: String(e) };
    }
}

