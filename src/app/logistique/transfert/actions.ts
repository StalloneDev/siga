"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTransferts() {
    return await prisma.transfertCarburant.findMany({
        include: {
            equipementSource: true,
            equipementDestination: true,
        },
        orderBy: { dateTransfert: "desc" },
    });
}

export async function getEquipementsByType(type: "BAC" | "CAMION") {
    return await prisma.equipementStockage.findMany({
        where: { typeEquipement: type, actif: true },
        orderBy: { nom: "asc" },
    });
}

export async function createTransfert(data: {
    equipementSourceId: number;
    equipementDestinationId: number;
    quantiteTransferee: number;
    referenceTransfert: string;
    dateTransfert: string;
}) {
    try {
        const transfert = await prisma.transfertCarburant.create({
            data: {
                equipementSourceId: data.equipementSourceId,
                equipementDestinationId: data.equipementDestinationId,
                quantiteTransferee: data.quantiteTransferee,
                referenceTransfert: data.referenceTransfert,
                dateTransfert: new Date(data.dateTransfert),
            } as any,
        });

        // Automatic stock movements (OUT from BAC, IN to Truck)
        await prisma.mouvementStock.createMany({
            data: [
                {
                    equipementId: data.equipementSourceId,
                    typeMouvement: "TRANSFERT_SORTIE" as any,
                    quantite: data.quantiteTransferee,
                    referenceType: "TRANSFERT",
                    referenceId: transfert.id,
                    dateMouvement: new Date(data.dateTransfert),
                },
                {
                    equipementId: data.equipementDestinationId,
                    typeMouvement: "TRANSFERT_ENTREE" as any,
                    quantite: data.quantiteTransferee,
                    referenceType: "TRANSFERT",
                    referenceId: transfert.id,
                    dateMouvement: new Date(data.dateTransfert),
                },
            ],
        });

        // Automatic stock alert check
        try {
            const { checkStockAlert } = await import("@/lib/alert-service");
            await checkStockAlert(data.equipementSourceId);
            await checkStockAlert(data.equipementDestinationId);
        } catch (e) {
            console.error("Alert check failed:", e);
        }

        revalidatePath("/logistique/transfert");
        revalidatePath("/logistique/mouvements");
        return { success: true };
    } catch (error: any) {
        console.error(error);
        if (error.code === "P2002") {
            return { success: false, error: "Cette référence de transfert existe déjà." };
        }
        return { success: false, error: "Erreur lors de l'enregistrement du transfert." };
    }
}

export async function deleteTransfert(id: number) {
    try {
        await prisma.mouvementStock.deleteMany({
            where: { referenceType: "TRANSFERT", referenceId: id },
        });
        await prisma.transfertCarburant.delete({ where: { id } });
        revalidatePath("/logistique/transfert");
        revalidatePath("/logistique/mouvements");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression." };
    }
}
