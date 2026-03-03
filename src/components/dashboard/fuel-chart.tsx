"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartData {
    date: string;
    delivered: number;
    predicted: number;
}

export function FuelChart({ chartData }: { chartData: ChartData[] }) {
    // Fill with empty data if none
    const data = chartData.length > 0 ? chartData : [
        { date: "N/A", delivered: 0, predicted: 0 }
    ];

    const totalDelivered = chartData.reduce((sum, item) => sum + (item.delivered || 0), 0);
    const totalPredicted = chartData.reduce((sum, item) => sum + (item.predicted || 0), 0);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Avitaillements (30 derniers jours)</h3>
                    <p className="text-xs text-slate-400 mt-1">Volumes cumulés par jour</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-blue-400">Live Data</span>
                </div>
            </div>

            <div className="flex-1 h-[250px] w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}kL`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                            itemStyle={{ fontSize: "12px" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#d97706"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorPredicted)"
                            name="Prévu (L)"
                        />
                        <Area
                            type="monotone"
                            dataKey="delivered"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorDelivered)"
                            name="Livré (L)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Volume Réel</p>
                    <p className="text-xl font-bold text-white">{totalDelivered.toLocaleString()} L</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Volume Prévu</p>
                    <p className="text-xl font-bold text-amber-500">{totalPredicted.toLocaleString()} L</p>
                </div>
            </div>
        </div>
    );
}
