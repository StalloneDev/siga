"use server";

import prisma from "@/lib/prisma";
import { getStockActuel } from "@/app/logistique/mouvements/actions";

export async function getDashboardData() {
    const today = new Date();
    const startOf30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const results = await Promise.all([
        getStockActuel().catch(() => []),
        prisma.programmeVol.findMany({
            where: {
                dateProgrammee: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
            include: {
                compagnie: true,
                avion: { include: { typeAvion: true } },
                aeroportArrivee: true,
                aeroportDepart: true,
                avitaillements: true,
            },
            orderBy: { heureArriveePrevue: "asc" },
        }).catch(() => []),
        prisma.$queryRaw<{ date: string; delivered: number; predicted: number }[]>`
            SELECT 
                TO_CHAR(DATE_TRUNC('day', date_operation), 'DD/MM') AS date,
                SUM(quantite_livree)::int AS delivered,
                (SELECT SUM(quantite_prevue)::int FROM programme_vol WHERE DATE_TRUNC('day', date_programmee) = DATE_TRUNC('day', avitaillement.date_operation)) AS predicted
            FROM avitaillement
            WHERE date_operation >= NOW() - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', date_operation)
            ORDER BY DATE_TRUNC('day', date_operation)
        `.catch(() => []),
        prisma.$queryRaw<{ avg_daily: number }[]>`
            SELECT COALESCE(SUM(quantite_livree)::float / 7, 0) as avg_daily
            FROM avitaillement
            WHERE date_operation >= NOW() - INTERVAL '7 days'
        `.catch(() => [{ avg_daily: 0 }]),
        prisma.equipementStockage.count({
            where: {
                dateProchaineMaintenance: {
                    lt: new Date()
                }
            }
        } as any).catch(() => 0),
    ]);

    const stocksActuels = results[0] as any[];
    const volsDuJour = results[1] as any[];
    const avitaillements30jours = results[2] as any[];
    const consommation7jours = results[3] as any[];
    const maintenanceEnRetard = results[4] as number;

    const avgDaily = consommation7jours[0]?.avg_daily || 0;
    const totalStockBacs = stocksActuels
        .filter((s: any) => s.typeEquipement === "BAC")
        .reduce((sum: number, s: any) => sum + s.stockActuel, 0);

    const autonomieJours = avgDaily > 0 ? Math.floor(totalStockBacs / avgDaily) : null;

    return {
        stocksActuels,
        volsDuJour,
        avitaillements30jours,
        analytics: {
            avgDaily,
            autonomieJours,
            totalStockBacs,
            maintenanceEnRetard
        }
    };
}
