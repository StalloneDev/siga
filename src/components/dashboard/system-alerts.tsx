"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { getNotifications, markAsRead, clearAllNotifications } from "@/app/notifications-actions";

interface Stock {
    id: number;
    nom: string;
    stockActuel: number;
    capaciteMaximale: number;
    seuilAlerte?: number;
}

export function SystemAlerts({ stocks }: { stocks: Stock[] }) {
    const [notifications, setNotifications] = React.useState<any[]>([]);

    React.useEffect(() => {
        getNotifications().then(setNotifications);
    }, []);

    // Local alerts based on immediate stock levels (dynamic check)
    const stockAlerts = stocks
        .filter(s => s.seuilAlerte ? s.stockActuel <= s.seuilAlerte : (s.stockActuel / s.capaciteMaximale) < 0.2)
        .map(s => ({
            id: `stock-${s.id}`,
            type: s.seuilAlerte && s.stockActuel <= (s.seuilAlerte / 2) ? "critical" : "warning",
            message: `Niveau bas : ${s.nom} (${s.stockActuel.toLocaleString()} L)`,
            time: "Direct"
        }));

    const allAlerts = [...notifications, ...stockAlerts].slice(0, 5);

    const handleClear = async () => {
        await clearAllNotifications();
        setNotifications([]);
    };

    const handleRead = async (id: number) => {
        if (typeof id === 'number') {
            await markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Alertes Système</h3>
                    {allAlerts.length > 0 && <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-1.5 rounded-full">{allAlerts.length}</span>}
                </div>
                <button onClick={handleClear} className="text-xs text-slate-500 hover:text-white transition-colors">Effacer tout</button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                {allAlerts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic text-sm">
                        Aucune alerte en cours
                    </div>
                ) : (
                    allAlerts.map((alert) => (
                        <div key={alert.id} className="group relative flex gap-4 p-3 rounded-xl bg-slate-800/20 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer">
                            <div className={`mt-0.5 ${alert.type === "critical" ? "text-red-500" :
                                alert.type === "warning" ? "text-amber-500" :
                                    alert.type === "success" ? "text-green-500" : "text-blue-500"
                                }`}>
                                {(alert.type === "warning" || alert.type === "critical") && <AlertTriangle size={18} className={alert.type === "critical" ? "animate-pulse" : ""} />}
                                {alert.type === "success" && <CheckCircle2 size={18} />}
                                {alert.type === "info" && <Info size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-medium text-slate-200 line-clamp-2 leading-relaxed">{alert.message}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{alert.time || "Maintenant"}</p>
                                    {typeof alert.id === 'number' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRead(alert.id); }}
                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white p-0.5 rounded transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
