"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkStockAlert } from "@/lib/alert-service";

export async function getAvitaillements() {
    return await prisma.avitaillement.findMany({
        include: {
            programmeVol: { include: { compagnie: true, avion: { include: { typeAvion: true } } } },
            camion: true,
        },
        orderBy: { dateOperation: "desc" },
        take: 50,
    });
}

export async function getLastCounter(camionId: number) {
    const last = await prisma.avitaillement.findFirst({
        where: { camionId },
        orderBy: { dateOperation: "desc" },
    });

    if (last) return Number(last.compteurApres);

    const camion = await prisma.equipementStockage.findUnique({
        where: { id: camionId },
        select: { stockInitial: true }
    });

    return camion?.stockInitial || 0;
}

export async function getAvitaillementFormData() {
    const [vols, camions] = await Promise.all([
        prisma.programmeVol.findMany({
            where: { statut: { in: ["PREVU", "ARRIVE"] } },
            include: { compagnie: true, avion: { include: { typeAvion: true } } },
            orderBy: { heureArriveePrevue: "asc" },
        }),
        prisma.equipementStockage.findMany({ where: { typeEquipement: "CAMION", actif: true }, orderBy: { nom: "asc" } }),
    ]);
    return { vols, camions };
}

export async function createAvitaillement(data: {
    programmeVolId: number;
    camionId: number;
    quantiteLivree: number;
    numeroBonLivraison: string;
    dateOperation: string;
}) {
    try {
        // Fetch the absolute latest counter for this truck on the server
        const avant = await getLastCounter(data.camionId);
        const apres = avant + data.quantiteLivree;

        const avitaillement = await prisma.avitaillement.create({
            data: {
                programmeVolId: data.programmeVolId,
                camionId: data.camionId,
                quantiteLivree: data.quantiteLivree,
                compteurAvant: BigInt(Math.floor(avant)),
                compteurApres: BigInt(Math.floor(apres)),
                numeroBonLivraison: data.numeroBonLivraison,
                dateOperation: new Date(data.dateOperation),
                operateurId: null as any,
            },
        });

        // Automatic stock movement (OUT from Truck)
        await prisma.mouvementStock.create({
            data: {
                equipementId: data.camionId,
                typeMouvement: "AVITAILLEMENT" as any,
                quantite: data.quantiteLivree,
                referenceType: "AVITAILLEMENT",
                referenceId: avitaillement.id,
                dateMouvement: new Date(),
            },
        });

        // Automatic stock alert check
        await checkStockAlert(data.camionId);

        // Mark flight as having arrived (fuel was loaded)
        await prisma.programmeVol.update({
            where: { id: data.programmeVolId },
            data: { statut: "ARRIVE" },
        });

        revalidatePath("/vols/programme");
        revalidatePath("/vols/avitaillement");
        revalidatePath("/logistique/mouvements");
        return { success: true, bonLivraison: data.numeroBonLivraison };
    } catch (error: any) {
        if (error.code === "P2002") return { success: false, error: "Ce numéro de bon existe déjà." };
        console.error(error);
        return { success: false, error: "Erreur lors de l'avitaillement." };
    }
}
