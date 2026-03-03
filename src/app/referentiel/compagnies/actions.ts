"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompagnies() {
    try {
        return await prisma.compagnieAerienne.findMany({
            orderBy: { nom: "asc" },
        });
    } catch (error) {
        console.error("Failed to fetch compagnies:", error);
        return [];
    }
}

export async function createCompagnie(formData: {
    nom: string;
    codeIata: string;
    codeIcao: string;
    pays: string;
}) {
    try {
        await prisma.compagnieAerienne.create({
            data: {
                nom: formData.nom,
                codeIata: formData.codeIata,
                codeIcao: formData.codeIcao,
                pays: formData.pays,
            },
        });
        revalidatePath("/referentiel/compagnies");
        return { success: true };
    } catch (error) {
        console.error("Failed to create compagnie:", error);
        return { success: false, error: "Erreur lors de la création" };
    }
}

export async function deleteCompagnie(id: number) {
    try {
        await prisma.compagnieAerienne.delete({
            where: { id },
        });
        revalidatePath("/referentiel/compagnies");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete compagnie:", error);
        return { success: false, error: "Erreur lors de la suppression" };
    }
}

export async function toggleCompagnieStatus(id: number, currentStatus: boolean) {
    try {
        await prisma.compagnieAerienne.update({
            where: { id },
            data: { actif: !currentStatus },
        });
        revalidatePath("/referentiel/compagnies");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status:", error);
        return { success: false };
    }
}
