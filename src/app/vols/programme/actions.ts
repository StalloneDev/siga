"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProgrammeVols(date?: string) {
    const where = date
        ? { dateProgrammee: new Date(date) }
        : {};

    return await prisma.programmeVol.findMany({
        where,
        include: {
            compagnie: true,
            typeAvion: true,
            aeroportArrivee: true,
            aeroportDepart: true,
            avitaillements: true,
        } as any,
        orderBy: { heureArriveePrevue: "asc" },
    });
}

export async function getVolFormData() {
    const [compagnies, typeAvions, aeroports] = await Promise.all([
        prisma.compagnieAerienne.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
        prisma.typeAvion.findMany({ orderBy: { modele: "asc" } }),
        prisma.aeroport.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
    ]);
    return { compagnies, typeAvions, aeroports };
}

export async function createVol(data: {
    numeroVol: string;
    compagnieId: number;
    immatriculation: string;
    typeAvionManual: string;
    aeroportArriveeId: number;
    aeroportDepartId: number;
    dateProgrammee: string;
    heureArriveePrevue: string;
    heureDepartPrevue: string;
    quantitePrevue: number;
}) {
    try {
        await prisma.programmeVol.create({
            data: {
                numeroVol: data.numeroVol,
                compagnieId: data.compagnieId,
                immatriculation: data.immatriculation,
                typeAvionManual: data.typeAvionManual,
                aeroportArriveeId: data.aeroportArriveeId,
                aeroportDepartId: data.aeroportDepartId,
                dateProgrammee: new Date(data.dateProgrammee),
                heureArriveePrevue: new Date(`${data.dateProgrammee}T${data.heureArriveePrevue}`),
                heureDepartPrevue: new Date(`${data.dateProgrammee}T${data.heureDepartPrevue}`),
                quantitePrevue: data.quantitePrevue,
            } as any,
        });
        revalidatePath("/vols/programme");
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") return { success: false, error: "Ce numéro de vol existe déjà pour cette date." };
        return { success: false, error: "Erreur lors de la création du vol." };
    }
}

export async function updateVolStatut(id: number, statut: "PREVU" | "ARRIVE" | "PARTI" | "ANNULE") {
    await prisma.programmeVol.update({ where: { id }, data: { statut } });
    revalidatePath("/vols/programme");
    return { success: true };
}

export async function deleteVol(id: number) {
    try {
        await prisma.programmeVol.delete({ where: { id } });
        revalidatePath("/vols/programme");
        return { success: true };
    } catch {
        return { success: false, error: "Impossible de supprimer un vol avec des avitaillements." };
    }
}

export async function getDailyFuelingKPIs(dateInput?: string) {
    const targetDate = dateInput ? new Date(dateInput) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // 1. Calculate Opening Stock (Initial + Movements before targetDate)
    const [equipements, movementsBefore] = await Promise.all([
        prisma.equipementStockage.findMany({ select: { stockInitial: true } }),
        prisma.mouvementStock.aggregate({
            where: {
                dateMouvement: { lt: targetDate },
                typeMouvement: { in: ['RECEPTION', 'TRANSFERT_ENTREE', 'AJUSTEMENT', 'AVITAILLEMENT', 'TRANSFERT_SORTIE'] }
            },
            _sum: { quantite: true }
        })
    ]);

    // Note: In our current schema, we handle quantite with signs or typeMouvement.
    // Based on previous edits, it seems we sum quantite which might be adjusted by type.
    // However, to be precise, we need to know if quantite in mouvementStock is absolute or signed.
    // Let's assume absolute and we need to add/subtract based on type.

    // Better calculation based on the logic in alert-service
    const [inflows, outflows] = await Promise.all([
        prisma.mouvementStock.aggregate({
            where: {
                dateMouvement: { lt: targetDate },
                typeMouvement: { in: ['RECEPTION', 'TRANSFERT_ENTREE', 'AJUSTEMENT'] }
            },
            _sum: { quantite: true }
        }),
        prisma.mouvementStock.aggregate({
            where: {
                dateMouvement: { lt: targetDate },
                typeMouvement: { in: ['AVITAILLEMENT', 'TRANSFERT_SORTIE'] }
            },
            _sum: { quantite: true }
        })
    ]);

    const initialTotal = equipements.reduce((sum, eq) => sum + eq.stockInitial, 0);
    const totalOpeningStock = initialTotal + (inflows._sum.quantite || 0) - (outflows._sum.quantite || 0);

    // 2. Security Stock (20,000 as per user image)
    const securityStock = 20000;

    // 3. Available Delivery Opening Stock
    const availableDelivery = Math.max(0, totalOpeningStock - securityStock);

    // 4. Today's Receptions (Fueling Replenishment)
    const todayReceptions = await prisma.mouvementStock.aggregate({
        where: {
            dateMouvement: { gte: targetDate, lt: nextDay },
            typeMouvement: 'RECEPTION'
        },
        _sum: { quantite: true }
    });
    const totalTodayReceptions = todayReceptions._sum.quantite || 0;

    // 5. Uplift qty Forecast for the day
    const dayFlights = await prisma.programmeVol.findMany({
        where: {
            dateProgrammee: targetDate,
            statut: { not: 'ANNULE' }
        },
        select: { quantitePrevue: true }
    });
    const upliftForecast = dayFlights.reduce((sum, v) => sum + v.quantitePrevue, 0);

    // 6. Theoretical Closing Stock (Opening Available + Today's Inflows - Forecast)
    const theoreticalClosing = availableDelivery + totalTodayReceptions - upliftForecast;

    return {
        totalOpeningStock,
        securityStock,
        availableDelivery,
        todayReceptions: totalTodayReceptions,
        upliftForecast,
        theoreticalClosing
    };
}
