"use client";

import React from "react";
import { TrendingUp, TrendingDown, BarChart3, Wrench, Download } from "lucide-react";
import * as XLSX from "xlsx";

const typeConfig = {
    RECEPTION: { label: "Réception", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", icon: TrendingUp, sign: "+" },
    TRANSFERT_ENTREE: { label: "Transfert Entrée", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: TrendingUp, sign: "+" },
    TRANSFERT_SORTIE: { label: "Transfert Sortie", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: TrendingDown, sign: "-" },
    AVITAILLEMENT: { label: "Avitaillement", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: TrendingDown, sign: "-" },
    AJUSTEMENT: { label: "Ajustement", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Wrench, sign: "±" },
};

interface Mouvement {
    id: number;
    typeMouvement: string;
    quantite: number;
    referenceType: string;
    referenceId: number;
    dateMouvement: Date;
    equipement: { nom: string };
}

export function MouvementsClient({ initialData }: { initialData: Mouvement[] }) {
    const handleExport = () => {
        const exportData = initialData.map(m => ({
            "Date & Heure": new Date(m.dateMouvement).toLocaleString("fr-FR"),
            "Type": typeConfig[m.typeMouvement as keyof typeof typeConfig]?.label || m.typeMouvement,
            "Équipement": m.equipement.nom,
            "Quantité (L)": m.quantite,
            "Référence": `${m.referenceType}#${m.referenceId}`
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mouvements");
        XLSX.writeFile(wb, `SIGA_Mouvements_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Legend & Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                    {Object.entries(typeConfig).map(([key, conf]) => (
                        <span key={key} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${conf.bg} ${conf.color}`}>
                            {conf.label}
                        </span>
                    ))}
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Download size={16} />
                    Exporter Excel
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date & Heure</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Équipement</th>
                                <th className="px-5 py-3 text-right">Quantité (L)</th>
                                <th className="px-5 py-3">Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 italic">
                                        Aucun mouvement enregistré
                                    </td>
                                </tr>
                            ) : (
                                initialData.map((m) => {
                                    const conf = typeConfig[m.typeMouvement as keyof typeof typeConfig];
                                    const isPositive = conf?.sign === "+";
                                    return (
                                        <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="px-5 py-3 text-sm text-slate-300">
                                                {new Date(m.dateMouvement).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                                                {" "}
                                                <span className="font-mono text-slate-500 text-xs">
                                                    {new Date(m.dateMouvement).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${conf?.bg ?? ""} ${conf?.color ?? "text-slate-400"}`}>
                                                    {conf?.label ?? m.typeMouvement}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-slate-200 font-medium">{m.equipement.nom}</td>
                                            <td className={`px-5 py-3 text-right font-mono text-sm font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                                {conf?.sign}{m.quantite.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-mono text-slate-500">{m.referenceType}#{m.referenceId}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
