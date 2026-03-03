"use client";

import React from "react";
import { Fuel, Truck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Stock {
    id: number;
    nom: string;
    typeEquipement: string;
    capaciteMaximale: number;
    stockActuel: number;
}

export function StockStatus({ stocks }: { stocks: Stock[] }) {
    if (stocks.length === 0) {
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                <Fuel size={32} className="opacity-30" />
                <p className="text-sm">Aucun équipement configuré</p>
                <Link href="/referentiel/equipements" className="text-xs text-blue-400 hover:underline">Configurer →</Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">État des Stocks Live</h3>
                <Link href="/logistique/mouvements" className="text-xs text-blue-400 font-medium hover:underline">Détail</Link>
            </div>
            <div className="space-y-5 flex-1">
                {stocks.map((stock) => {
                    const percentage = stock.capaciteMaximale > 0
                        ? Math.min(100, Math.round((stock.stockActuel / stock.capaciteMaximale) * 100))
                        : 0;
                    const isLow = percentage < 20;
                    const isMed = percentage >= 20 && percentage < 50;
                    const barColor = isLow ? "bg-red-500" : isMed ? "bg-amber-500" : "bg-blue-600";
                    return (
                        <div key={stock.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-slate-300 min-w-0">
                                    {stock.typeEquipement === "BAC"
                                        ? <Fuel size={16} className="text-blue-500 shrink-0" />
                                        : <Truck size={16} className="text-cyan-500 shrink-0" />}
                                    <span className="font-medium truncate">{stock.nom}</span>
                                    {isLow && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                                </div>
                                <span className={`font-mono font-bold ml-2 ${isLow ? "text-red-400" : isMed ? "text-amber-400" : "text-slate-400"}`}>{percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono tracking-tighter">
                                <span>{stock.stockActuel.toLocaleString()} L</span>
                                <span>{stock.capaciteMaximale.toLocaleString()} L</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
