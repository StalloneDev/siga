"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getStockActuel } from "../mouvements/actions";

export async function getJaugeages() {
    return await prisma.jaugeage.findMany({
        include: { equipement: true },
        orderBy: { dateJaugeage: "desc" },
    });
}

export async function createJaugeage(data: {
    equipementId: number;
    dateJaugeage: string;
    valeurDipMm: number;
    temperature: number;
    volumeMesure: number;
}) {
    try {
        // Get current theoretical stock
        const stocks = await getStockActuel();
        const stockEquipement = stocks.find(s => s.id === data.equipementId);
        const stockTheorique = stockEquipement?.stockActuel ?? 0;
        const ecart = data.volumeMesure - stockTheorique;

        await prisma.jaugeage.create({
            data: {
                equipementId: data.equipementId,
                dateJaugeage: new Date(data.dateJaugeage),
                valeurDipMm: data.valeurDipMm,
                temperature: data.temperature,
                volumeMesure: data.volumeMesure,
                stockTheorique,
                ecart,
            },
        });

        revalidatePath("/logistique/jaugeage");
        return { success: true, ecart, stockTheorique };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Erreur lors de l'enregistrement du jaugeage." };
    }
}

export async function getEquipements() {
    return await prisma.equipementStockage.findMany({
        where: { actif: true },
        orderBy: [{ typeEquipement: "asc" }, { nom: "asc" }],
    });
}
