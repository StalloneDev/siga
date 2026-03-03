"use server";

import prisma from "@/lib/prisma";
import { getStockActuel } from "../logistique/mouvements/actions";

export async function getAnalyseData() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
        stocksActuels,
        receptionsThisMois,
        avitaillementsThisMois,
        volsParStatut,
        receptions30days,
    ] = await Promise.all([
        getStockActuel(),
        prisma.receptionCarburant.aggregate({
            where: { dateReception: { gte: startOfMonth } },
            _sum: { quantiteRecue: true },
            _count: true,
        }),
        prisma.avitaillement.aggregate({
            where: { dateOperation: { gte: startOfMonth } },
            _sum: { quantiteLivree: true },
            _count: true,
        }),
        prisma.programmeVol.groupBy({
            by: ["statut"],
            _count: { id: true },
            where: { dateProgrammee: { gte: startOfMonth } },
        }),
        // Last 30 days: daily reception totals
        prisma.$queryRaw<{ date: string; total: number }[]>`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', date_reception), 'DD/MM') AS date,
        SUM(quantite_recue)::int AS total
      FROM reception_carburant
      WHERE date_reception >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', date_reception)
      ORDER BY DATE_TRUNC('day', date_reception)
    `,
    ]);

    return {
        stocksActuels,
        receptionsThisMois,
        avitaillementsThisMois,
        volsParStatut,
        receptions30days,
    };
}

export async function getAvitaillementsChart() {
    // Last 7 days avitaillements per day
    const result = await prisma.$queryRaw<{ date: string; total: number }[]>`
    SELECT 
      TO_CHAR(DATE_TRUNC('day', date_operation), 'DD/MM') AS date,
      SUM(quantite_livree)::int AS total
    FROM avitaillement
    WHERE date_operation >= NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('day', date_operation)
    ORDER BY DATE_TRUNC('day', date_operation)
  `;
    return result;
}
