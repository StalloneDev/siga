import React from "react";
import { getAnalyseData } from "./actions";
import { AnalyseClient } from "./analyse-client";

export default async function AnalysePage() {
    const data = await getAnalyseData();

    // Serialize for client (Decimal → number, and compute stockPercent)
    const stocksActuels = data.stocksActuels.map(s => ({
        ...s,
        stockPct: s.capaciteMaximale > 0 ? Math.round((s.stockActuel / s.capaciteMaximale) * 100) : 0,
    }));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Analyse & Performance</h2>
                <p className="text-slate-400 text-sm mt-1">Vue consolidée des KPIs et performances opérationnelles.</p>
            </div>
            <AnalyseClient
                stocksActuels={stocksActuels}
                receptionsThisMois={{
                    count: data.receptionsThisMois._count,
                    total: data.receptionsThisMois._sum.quantiteRecue ?? 0,
                }}
                avitaillementsThisMois={{
                    count: data.avitaillementsThisMois._count,
                    total: data.avitaillementsThisMois._sum.quantiteLivree ?? 0,
                }}
                volsParStatut={data.volsParStatut}
                receptions30days={data.receptions30days}
            />
        </div>
    );
}
