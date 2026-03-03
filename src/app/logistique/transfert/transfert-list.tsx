"use client";

import React from "react";
import { Trash2, ArrowRight, Truck, Plus, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TransfertForm } from "@/components/forms/transfert-form";
import { deleteTransfert } from "./actions";
import * as XLSX from "xlsx";

interface Equipement { id: number; nom: string; capaciteMaximale: number; }
interface Transfert {
    id: number;
    referenceTransfert: string;
    quantiteTransferee: number;
    dateTransfert: Date;
    equipementSource: { nom: string };
    equipementDestination: { nom: string };
}

export function TransfertList({
    initialData, bacs, camions,
}: { initialData: Transfert[]; bacs: Equipement[]; camions: Equipement[] }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [data, setData] = React.useState(initialData);
    React.useEffect(() => { setData(initialData); }, [initialData]);

    const totalTransfere = data.reduce((sum, t) => sum + t.quantiteTransferee, 0);

    const handleExport = () => {
        const exportData = data.map(t => ({
            "Date": new Date(t.dateTransfert).toLocaleDateString("fr-FR"),
            "Heure": new Date(t.dateTransfert).toLocaleTimeString("fr-FR"),
            "Référence": t.referenceTransfert,
            "Source": t.equipementSource.nom,
            "Destination": t.equipementDestination.nom,
            "Quantité (L)": t.quantiteTransferee
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transferts");
        XLSX.writeFile(wb, `SIGA_Transferts_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    async function handleDelete(id: number) {
        if (confirm("Supprimer ce transfert ? Les mouvements de stock seront annulés.")) {
            const result = await deleteTransfert(id);
            if (!result.success) alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Transferts effectués", value: data.length.toString(), unit: "opérations" },
                    { label: "Volume Total Transféré", value: totalTransfere.toLocaleString(), unit: "litres" },
                    { label: "Camions Ravitaillés", value: `${new Set(data.map(t => t.equipementDestination.nom)).size}`, unit: "camions" },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <Truck className="text-cyan-500 shrink-0" size={24} />
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value} <span className="text-sm font-normal text-slate-500">{stat.unit}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <h3 className="text-base font-semibold text-white">Historique des Transferts</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
                        >
                            <Download size={16} /> Exporter
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                            <Plus size={16} /> Nouveau Transfert
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Référence</th>
                                <th className="px-5 py-3">Flux</th>
                                <th className="px-5 py-3 text-right">Quantité (L)</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Aucun transfert enregistré</td></tr>
                            ) : (
                                data.map(t => (
                                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-300">
                                            {new Date(t.dateTransfert).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                            <br />
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {new Date(t.dateTransfert).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-sm text-blue-400">{t.referenceTransfert}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-blue-400 font-medium">{t.equipementSource.nom}</span>
                                                <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                                <span className="text-cyan-400 font-medium">{t.equipementDestination.nom}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-sm text-cyan-400 font-bold">{t.quantiteTransferee.toLocaleString()}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Transfert BAC → Camion">
                <TransfertForm bacs={bacs} camions={camions} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
