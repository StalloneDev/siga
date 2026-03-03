"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// TypeAvion Actions
export async function getTypeAvions() {
    return await prisma.typeAvion.findMany({ orderBy: { modele: "asc" } });
}

export async function createTypeAvion(data: {
    constructeur: string;
    modele: string;
    codeIata: string;
    codeIcao: string;
    capaciteReservoir: number;
}) {
    try {
        await prisma.typeAvion.create({ data });
        revalidatePath("/referentiel/avions");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création du type" };
    }
}

// Avion Actions
export async function getAvions() {
    return await prisma.avion.findMany({
        include: { typeAvion: true, compagnie: true },
        orderBy: { immatriculation: "asc" },
    });
}

export async function createAvion(data: {
    immatriculation: string;
    typeAvionId: number;
    compagnieId: number;
}) {
    try {
        await prisma.avion.create({ data });
        revalidatePath("/referentiel/avions");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création de l'avion" };
    }
}

export async function deleteAvion(id: number) {
    try {
        await prisma.avion.delete({ where: { id } });
        revalidatePath("/referentiel/avions");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" };
    }
}
