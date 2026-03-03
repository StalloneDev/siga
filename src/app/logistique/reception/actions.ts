"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReceptions() {
  return await prisma.receptionCarburant.findMany({
    include: { equipementDestination: true },
    orderBy: { dateReception: "desc" },
  });
}

export async function getBacs() {
  return await prisma.equipementStockage.findMany({
    where: { typeEquipement: "BAC", actif: true },
    orderBy: { nom: "asc" },
  });
}

export async function createReception(data: {
  fournisseur: string;
  depotChargement: string;
  referenceBonLivraison: string;
  quantiteRecue: number;
  densite: number;
  temperature: number;
  equipementDestinationId: number;
  dateReception: string;
}) {
  try {
    const reception = await (prisma.receptionCarburant as any).create({
      data: {
        fournisseur: data.fournisseur,
        depotChargement: data.depotChargement,
        referenceBonLivraison: data.referenceBonLivraison,
        quantiteRecue: data.quantiteRecue,
        densite: data.densite,
        temperature: data.temperature,
        equipementDestinationId: data.equipementDestinationId,
        dateReception: new Date(data.dateReception),
      },
    });

    // Automatic stock movement: RECEPTION
    await prisma.mouvementStock.create({
      data: {
        equipementId: data.equipementDestinationId,
        typeMouvement: "RECEPTION" as any,
        quantite: data.quantiteRecue,
        referenceType: "RECEPTION",
        referenceId: reception.id,
        dateMouvement: new Date(data.dateReception),
      },
    });

    // Automatic stock alert check
    try {
      const { checkStockAlert } = await import("@/lib/alert-service");
      await checkStockAlert(data.equipementDestinationId);
    } catch (e) {
      console.error("Alert check failed:", e);
    }

    revalidatePath("/logistique/reception");
    revalidatePath("/logistique/mouvements");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return { success: false, error: "Ce numéro de bon de livraison existe déjà." };
    }
    return { success: false, error: "Erreur lors de l'enregistrement de la réception." };
  }
}

export async function deleteReception(id: number) {
  try {
    await prisma.mouvementStock.deleteMany({
      where: { referenceType: "RECEPTION", referenceId: id },
    });
    await prisma.receptionCarburant.delete({ where: { id } });
    revalidatePath("/logistique/reception");
    revalidatePath("/logistique/mouvements");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}
