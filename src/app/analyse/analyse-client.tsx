"use client";

import React from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Fuel, PackageCheck, PlaneTakeoff, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
    stocksActuels: { id: number; nom: string; typeEquipement: string; capaciteMaximale: number; stockActuel: number; stockPct: number }[];
    receptionsThisMois: { count: number; total: number };
    avitaillementsThisMois: { count: number; total: number };
    volsParStatut: { statut: string; _count: { id: number } }[];
    receptions30days: { date: string; total: number }[];
}

const STATUT_COLORS: Record<string, string> = {
    PREVU: "#3b82f6", ARRIVE: "#f59e0b", PARTI: "#22c55e", ANNULE: "#ef4444",
};

const STATUT_LABELS: Record<string, string> = {
    PREVU: "Prévu", ARRIVE: "Arrivé", PARTI: "Parti", ANNULE: "Annulé",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
                <p className="text-slate-400 mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }} className="font-bold">{p.value?.toLocaleString()} L</p>
                ))}
            </div>
        );
    }
    return null;
};

export function AnalyseClient({ stocksActuels, receptionsThisMois, avitaillementsThisMois, volsParStatut, receptions30days }: Props) {
    const totalStockMax = stocksActuels.filter(s => s.typeEquipement === "BAC").reduce((s, e) => s + e.capaciteMaximale, 0);
    const totalStockActuel = stocksActuels.filter(s => s.typeEquipement === "BAC").reduce((s, e) => s + e.stockActuel, 0);
    const pctGlobal = totalStockMax > 0 ? Math.round((totalStockActuel / totalStockMax) * 100) : 0;

    const kpis = [
        {
            label: "Volume Reçu (mois)",
            value: receptionsThisMois.total.toLocaleString(),
            unit: "L",
            sub: `${receptionsThisMois.count} livraisons`,
            icon: PackageCheck,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
        },
        {
            label: "Volume Distribué (mois)",
            value: avitaillementsThisMois.total.toLocaleString(),
            unit: "L",
            sub: `${avitaillementsThisMois.count} avitaillements`,
            icon: Fuel,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
        },
        {
            label: "Stock Total BACs",
            value: totalStockActuel.toLocaleString(),
            unit: "L",
            sub: `${pctGlobal}% de capacité`,
            icon: TrendingUp,
            color: pctGlobal > 20 ? "text-green-400" : "text-red-400",
            bg: pctGlobal > 20 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20",
        },
        {
            label: "Vols Programmés (mois)",
            value: volsParStatut.reduce((s, v) => s + v._count.id, 0).toString(),
            unit: "vols",
            sub: `${volsParStatut.find(v => v.statut === "PARTI")?._count.id ?? 0} partis`,
            icon: PlaneTakeoff,
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
        },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {kpis.map(kpi => (
                    <div key={kpi.label} className={`bg-slate-900/40 border rounded-2xl p-5 ${kpi.bg}`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                            <kpi.icon size={18} className={kpi.color} />
                        </div>
                        <p className={`text-3xl font-bold ${kpi.color}`}>
                            {kpi.value} <span className="text-sm font-normal text-slate-500">{kpi.unit}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 30-day Reception Chart */}
                <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-white mb-1">Réceptions Carburant (30 jours)</h3>
                    <p className="text-xs text-slate-500 mb-5">Volume journalier reçu dans les cuves BAC</p>
                    <div className="h-52">
                        {receptions30days.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={receptions30days} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                    <defs>
                                        <linearGradient id="recColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={60} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fill="url(#recColor)" name="Volume" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>

                {/* Flight Status Pie */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-white mb-1">Statuts des Vols (mois)</h3>
                    <p className="text-xs text-slate-500 mb-4">Répartition par statut opérationnel</p>
                    {volsParStatut.length > 0 ? (
                        <>
                            <div className="h-36 mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={volsParStatut} dataKey="_count.id" nameKey="statut" cx="50%" cy="50%" outerRadius={60} strokeWidth={0}>
                                            {volsParStatut.map(v => (
                                                <Cell key={v.statut} fill={STATUT_COLORS[v.statut] ?? "#64748b"} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: any, name: any) => [val, STATUT_LABELS[name] ?? name]} contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {volsParStatut.map(v => (
                                    <div key={v.statut} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUT_COLORS[v.statut] }} />
                                            <span className="text-slate-400">{STATUT_LABELS[v.statut] ?? v.statut}</span>
                                        </div>
                                        <span className="font-bold text-slate-200">{v._count.id}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm py-8">Aucun vol ce mois</div>
                    )}
                </div>
            </div>

            {/* Stock Levels */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-5">État des Stocks en Temps Réel</h3>
                {stocksActuels.length === 0 ? (
                    <p className="text-slate-500 text-sm">Aucun équipement configuré</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {stocksActuels.map(eq => {
                            const pct = eq.stockPct;
                            const isLow = pct < 20;
                            const isMedium = pct >= 20 && pct < 50;
                            const barColor = isLow ? "bg-red-500" : isMedium ? "bg-amber-500" : "bg-green-500";
                            return (
                                <div key={eq.id} className="space-y-3 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{eq.nom}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">{eq.typeEquipement}</p>
                                        </div>
                                        {isLow
                                            ? <AlertTriangle size={16} className="text-red-500" />
                                            : <CheckCircle2 size={16} className="text-green-500" />
                                        }
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span className="font-mono">{eq.stockActuel.toLocaleString()} L</span>
                                            <span className="font-bold" style={{ color: isLow ? "#ef4444" : isMedium ? "#f59e0b" : "#22c55e" }}>{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${barColor}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-600 text-right">Cap. max : {eq.capaciteMaximale.toLocaleString()} L</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
