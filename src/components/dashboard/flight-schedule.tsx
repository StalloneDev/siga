"use client";

import React from "react";
import { Plane } from "lucide-react";
import Link from "next/link";

const STATUT_STYLES: Record<string, string> = {
    PREVU: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ARRIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
    PARTI: "bg-green-500/10 text-green-500 border-green-500/20",
    ANNULE: "bg-red-500/10 text-red-400 border-red-500/20 line-through",
};
const STATUT_LABELS: Record<string, string> = {
    PREVU: "Prévu", ARRIVE: "Arrivé", PARTI: "Parti", ANNULE: "Annulé",
};

interface Vol {
    id: number;
    numeroVol: string;
    statut: string;
    heureArriveePrevue: Date;
    heureDepartPrevue: Date;
    compagnie: { nom: string };
    avion: { immatriculation: string; typeAvion: { modele: string; capaciteReservoir: number } };
    aeroportArrivee: { codeIata: string };
    aeroportDepart: { codeIata: string };
    avitaillements: { quantiteLivree: number }[];
    quantitePrevue: number;
}

export function FlightSchedule({ vols }: { vols: Vol[] }) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Vols du Jour</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
                <Link href="/vols/programme" className="text-xs text-blue-400 font-medium hover:underline">Tout voir</Link>
            </div>

            {vols.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Plane size={32} className="opacity-30" />
                    <p className="text-sm">Aucun vol programmé aujourd'hui</p>
                    <Link href="/vols/programme" className="text-xs text-blue-400 hover:underline">Ajouter un vol →</Link>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <th className="pb-2">Vol n°</th>
                                <th className="pb-2">Appareil</th>
                                <th className="pb-2">ETA / ETD</th>
                                <th className="pb-2">Route</th>
                                <th className="pb-2 text-right">Fuel Req.</th>
                                <th className="pb-2">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vols.map(vol => {
                                const avitaille = vol.avitaillements.reduce((s, a) => s + a.quantiteLivree, 0);
                                return (
                                    <tr key={vol.id} className="group cursor-pointer">
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 rounded-l-lg border-y border-l border-slate-800 transition-colors">
                                            <span className="text-sm font-bold text-white">{vol.numeroVol}</span>
                                        </td>
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 border-y border-slate-800 transition-colors">
                                            <div className="text-xs text-slate-300">{vol.avion.immatriculation}</div>
                                            <div className="text-[10px] text-slate-500">{vol.avion.typeAvion.modele}</div>
                                        </td>
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 border-y border-slate-800 transition-colors">
                                            <div className="text-xs text-slate-200 font-mono">{new Date(vol.heureArriveePrevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{new Date(vol.heureDepartPrevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                                        </td>
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 border-y border-slate-800 transition-colors">
                                            <span className="text-xs font-mono text-blue-400">{vol.aeroportArrivee.codeIata}</span>
                                            <span className="text-slate-600 mx-1">→</span>
                                            <span className="text-xs font-mono text-purple-400">{vol.aeroportDepart.codeIata}</span>
                                        </td>
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 border-y border-slate-800 transition-colors text-right">
                                            <div className="text-xs font-mono text-amber-400">
                                                {vol.quantitePrevue > 0 ? `${vol.quantitePrevue.toLocaleString()} L` : "---"}
                                            </div>
                                            {avitaille > 0 && <div className="text-[10px] text-green-500">✓ {avitaille.toLocaleString()} L</div>}
                                        </td>
                                        <td className="bg-slate-900/30 group-hover:bg-slate-800/50 py-3 px-3 rounded-r-lg border-y border-r border-slate-800 transition-colors">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUT_STYLES[vol.statut] ?? ""}`}>
                                                {STATUT_LABELS[vol.statut] ?? vol.statut}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
