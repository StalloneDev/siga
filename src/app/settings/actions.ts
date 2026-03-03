"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
    const settings = await prisma.parametreSysteme.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: { cle: string; valeur: string }) => {
        settingsMap[s.cle] = s.valeur;
    });
    return settingsMap;
}

export async function updateSystemSetting(cle: string, valeur: string) {
    try {
        await prisma.parametreSysteme.upsert({
            where: { cle },
            update: { valeur },
            create: { cle, valeur }
        });
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du paramètre ${cle}:`, error);
        return { success: false, error: "Erreur de sauvegarde" };
    }
}
