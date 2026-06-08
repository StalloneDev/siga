"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EquipementType } from "@prisma/client";

/**
 * Invalide le cache de toutes les pages qui dépendent des données de stock.
 * À appeler après toute création, modification ou suppression d'un équipement,
 * car le stockInitial est utilisé comme base de calcul du stock actuel.
 */
function revalidateAllStockPages() {
    revalidatePath("/");                          // Tableau de bord (Prévisions de Stock)
    revalidatePath("/analyse");                   // Analyse & Performance (Stock Total BACs)
    revalidatePath("/logistique");                // Logistique
    revalidatePath("/logistique/mouvements");     // Journal des mouvements
    revalidatePath("/logistique/reception");      // Réceptions
    revalidatePath("/logistique/transfert");      // Transferts
    revalidatePath("/referentiel/equipements");   // Page équipements elle-même
}

export async function getEquipements() {
    return await prisma.equipementStockage.findMany({
        orderBy: { nom: "asc" },
    });
}

export async function createEquipement(data: {
    nom: string;
    typeEquipement: EquipementType;
    capaciteMaximale: number;
    stockInitial: number;
    seuilAlerte: number;
}) {
    try {
        await prisma.equipementStockage.create({ data });
        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création de l'équipement" };
    }
}

export async function deleteEquipement(id: number) {
    try {
        await prisma.equipementStockage.delete({ where: { id } });
        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" };
    }
}

export async function updateEquipement(id: number, data: {
    nom: string;
    typeEquipement: EquipementType;
    capaciteMaximale: number;
    stockInitial: number;
    seuilAlerte: number;
}) {
    try {
        // Récupérer l'équipement actuel avec ses mouvements pour recalculer le stock
        const currentEquipement = await prisma.equipementStockage.findUnique({
            where: { id },
            include: { mouvements: true },
        });

        if (!currentEquipement) {
            return { success: false, error: "Équipement non trouvé" };
        }

        // Si le stockInitial a changé, il faut créer un mouvement d'ajustement
        // pour que le stock calculé (stockInitial + mouvements) = nouveau stockInitial
        if (data.stockInitial !== currentEquipement.stockInitial) {
            // Calculer le delta actuel des mouvements
            const stockDelta = currentEquipement.mouvements.reduce((sum: number, m: { typeMouvement: string; quantite: number }) => {
                if (m.typeMouvement === "RECEPTION" || m.typeMouvement === "TRANSFERT_ENTREE" || m.typeMouvement === "AJUSTEMENT") {
                    return sum + m.quantite;
                } else {
                    return sum - m.quantite;
                }
            }, 0);

            // L'ajustement doit annuler le delta existant pour que :
            // newStockInitial + oldDelta + adjustment = newStockInitial
            // => adjustment = -oldDelta
            const adjustmentNeeded = -stockDelta;

            await prisma.$transaction([
                // 1. Mettre à jour l'équipement
                prisma.equipementStockage.update({ where: { id }, data }),
                // 2. Créer le mouvement d'ajustement compensatoire (si nécessaire)
                ...(adjustmentNeeded !== 0
                    ? [
                          prisma.mouvementStock.create({
                              data: {
                                  equipementId: id,
                                  typeMouvement: "AJUSTEMENT",
                                  quantite: adjustmentNeeded,
                                  referenceType: "AJUSTEMENT",
                                  referenceId: id,
                                  dateMouvement: new Date(),
                              },
                          }),
                      ]
                    : []),
            ]);
        } else {
            // Pas de changement de stockInitial, mise à jour simple
            await prisma.equipementStockage.update({ where: { id }, data });
        }

        revalidateAllStockPages();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour de l'équipement" };
    }
}
