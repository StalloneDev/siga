"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createTypeAvion(data: {
    constructeur: string;
    modele: string;
    codeIata: string;
    codeIcao: string;
    capaciteReservoir: number;
}) {
    try {
        await prisma.typeAvion.create({
            data: {
                constructeur: data.constructeur,
                modele: data.modele,
                codeIata: data.codeIata,
                codeIcao: data.codeIcao,
                capaciteReservoir: data.capaciteReservoir,
            },
        });
        revalidatePath("/referentiel");
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") return { success: false, error: "Ce type d'avion existe déjà." };
        return { success: false, error: "Erreur lors de la création." };
    }
}
