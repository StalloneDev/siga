"use client";

import React from "react";
import { Hourglass, TrendingDown, Calendar, AlertCircle } from "lucide-react";

interface Props {
    analytics: {
        avgDaily: number;
        autonomieJours: number | null;
        totalStockBacs: number;
        maintenanceEnRetard: number;
    }
}

export function StockPrediction({ analytics }: Props) {
    const { avgDaily, autonomieJours, totalStockBacs, maintenanceEnRetard } = analytics;

    const isLow = autonomieJours !== null && autonomieJours <= 3;
    const isCritical = autonomieJours !== null && autonomieJours <= 1;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Prévisions de Stock</h3>
                <Hourglass size={18} className="text-blue-500" />
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autonomie Estimée</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-5xl font-black italic ${isCritical ? "text-red-500" : isLow ? "text-amber-500" : "text-blue-400"
                            }`}>
                            {autonomieJours !== null ? autonomieJours : "∞"}
                        </span>
                        <span className="text-xl font-bold text-slate-400 self-end mb-1">Jours</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Conso. Moyenne</p>
                        <div className="flex items-center gap-1.5">
                            <TrendingDown size={14} className="text-cyan-500" />
                            <span className="text-sm font-mono font-bold text-slate-200">
                                {Math.round(avgDaily).toLocaleString()} L/j
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Stock Total BACs</p>
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="text-sm font-mono font-bold text-slate-200">
                                {totalStockBacs.toLocaleString()} L
                            </span>
                        </div>
                    </div>
                </div>

                {maintenanceEnRetard > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                        <Calendar size={16} className="shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-tight">Maintenance Requise</p>
                            <p className="text-[10px] font-medium leading-tight mt-0.5">
                                {maintenanceEnRetard} équipement(s) en retard de révision.
                            </p>
                        </div>
                    </div>
                )}

                {(autonomieJours !== null && maintenanceEnRetard === 0) && (
                    <div className={`mt-4 p-3 rounded-xl border flex items-start gap-3 ${isLow ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/5 border-blue-500/10 text-blue-400"
                        }`}>
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium leading-relaxed">
                            {isCritical
                                ? "ALERTE : Rupture de stock critique imminente (moins de 24h). Prévoyez une réception d'urgence."
                                : isLow
                                    ? "Attention : Le stock actuel couvre moins de 3 jours d'exploitation moyenne."
                                    : "L'autonomie est confortable basée sur la consommation des 7 derniers jours."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
