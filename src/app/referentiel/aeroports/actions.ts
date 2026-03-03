"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAeroports() {
    try {
        return await prisma.aeroport.findMany({
            orderBy: { nom: "asc" },
        });
    } catch (error) {
        console.error("Failed to fetch aeroports:", error);
        return [];
    }
}

export async function createAeroport(formData: {
    nom: string;
    ville: string;
    pays: string;
    codeIata: string;
    codeIcao: string;
}) {
    try {
        await prisma.aeroport.create({
            data: formData,
        });
        revalidatePath("/referentiel/aeroports");
        return { success: true };
    } catch (error) {
        console.error("Failed to create aeroport:", error);
        return { success: false, error: "Erreur lors de la création" };
    }
}

export async function deleteAeroport(id: number) {
    try {
        await prisma.aeroport.delete({
            where: { id },
        });
        revalidatePath("/referentiel/aeroports");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete aeroport:", error);
        return { success: false, error: "Erreur lors de la suppression" };
    }
}
