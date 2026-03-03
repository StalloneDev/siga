"use client";

import React from "react";
import { Gauge, Plus, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { JaugeageForm } from "@/components/forms/jaugeage-form";
import * as XLSX from "xlsx";

interface Jaugeage {
    id: number;
    dateJaugeage: Date;
    valeurDipMm: number;
    temperature: number;
    volumeMesure: number;
    stockTheorique: number;
    ecart: number;
    equipement: { nom: string; typeEquipement: string };
}

interface Equipement {
    id: number;
    nom: string;
    typeEquipement: string;
}

export function JaugeageClient({ initialData, equipements }: { initialData: Jaugeage[]; equipements: Equipement[] }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [data, setData] = React.useState(initialData);
    React.useEffect(() => { setData(initialData); }, [initialData]);

    const ecartTotal = data.reduce((sum, j) => sum + j.ecart, 0);
    const anomalies = data.filter(j => Math.abs(j.ecart) >= 500).length;

    const handleExport = () => {
        const exportData = data.map(j => ({
            "Date": new Date(j.dateJaugeage).toLocaleDateString("fr-FR"),
            "Équipement": j.equipement.nom,
            "Température (°C)": Number(j.temperature),
            "DIP / Volume Mesuré (L)": j.volumeMesure,
            "Stock Théorique (L)": j.stockTheorique,
            "Écart (L)": j.ecart,
            "Statut": Math.abs(j.ecart) >= 500 ? "ANOMALIE" : "OK"
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Jaugeages");
        XLSX.writeFile(wb, `SIGA_Jaugeages_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                    <Gauge className="text-amber-400 shrink-0" size={24} />
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Jaugeages</p>
                        <p className="text-2xl font-bold text-white">{data.length}</p>
                    </div>
                </div>
                <div className={`border rounded-xl p-4 flex items-center gap-4 ${anomalies > 0 ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                    {anomalies > 0 ? <AlertTriangle className="text-red-400 shrink-0" size={24} /> : <CheckCircle2 className="text-green-400 shrink-0" size={24} />}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anomalies Détectées</p>
                        <p className={`text-2xl font-bold ${anomalies > 0 ? "text-red-400" : "text-green-400"}`}>{anomalies}</p>
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                    <Gauge className="text-purple-400 shrink-0" size={24} />
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Écart Cumulé</p>
                        <p className={`text-2xl font-bold ${ecartTotal >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {ecartTotal > 0 ? "+" : ""}{ecartTotal.toLocaleString()} L
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <h3 className="text-base font-semibold text-white">Historique des Jaugeages</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
                        >
                            <Download size={16} /> Exporter
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all">
                            <Plus size={16} /> Nouveau Jaugeage
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Équipement</th>
                                <th className="px-5 py-3 text-right">Temp (°C)</th>
                                <th className="px-5 py-3 text-right">DIP / Volume (L)</th>
                                <th className="px-5 py-3 text-right">Stock Théorique (L)</th>
                                <th className="px-5 py-3 text-right">Écart (L)</th>
                                <th className="px-5 py-3 text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">Aucun jaugeage enregistré</td></tr>
                            ) : (
                                data.map(j => {
                                    const isAnomalie = Math.abs(j.ecart) >= 500;
                                    return (
                                        <tr key={j.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${isAnomalie ? "bg-red-950/20" : ""}`}>
                                            <td className="px-5 py-3 text-sm text-slate-300">
                                                {new Date(j.dateJaugeage).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-slate-200 font-medium">{j.equipement.nom}</td>
                                            <td className="px-5 py-3 text-right font-mono text-sm text-slate-300">{Number(j.temperature).toFixed(1)}</td>
                                            <td className="px-5 py-3 text-right font-mono text-sm text-slate-200">{j.volumeMesure.toLocaleString()} L</td>
                                            <td className="px-5 py-3 text-right font-mono text-sm text-slate-400">{j.stockTheorique.toLocaleString()} L</td>
                                            <td className={`px-5 py-3 text-right font-mono text-sm font-bold ${j.ecart > 0 ? "text-green-400" : j.ecart < 0 ? "text-red-400" : "text-slate-400"}`}>
                                                {j.ecart > 0 ? "+" : ""}{j.ecart.toLocaleString()} L
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {isAnomalie
                                                    ? <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">ANOMALIE</span>
                                                    : <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">OK</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Contrôle Jaugeage">
                <JaugeageForm equipements={equipements} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
