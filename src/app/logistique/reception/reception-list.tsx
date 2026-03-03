"use client";

import React from "react";
import { Trash2, PackageCheck, Filter, Plus, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ReceptionForm } from "@/components/forms/reception-form";
import { deleteReception } from "./actions";
import * as XLSX from "xlsx";

interface Reception {
    id: number;
    fournisseur: string;
    depotChargement?: string | null;
    referenceBonLivraison: string;
    quantiteRecue: number;
    densite: number;
    temperature: number;
    dateReception: Date;
    equipementDestination: { nom: string };
}

interface Bac {
    id: number;
    nom: string;
    capaciteMaximale: number;
}

export function ReceptionList({ initialData, bacs }: { initialData: Reception[], bacs: Bac[] }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [data, setData] = React.useState(initialData);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const totalRecu = data.reduce((sum, r) => sum + r.quantiteRecue, 0);

    const handleExport = () => {
        const exportData = data.map(r => ({
            "Date": new Date(r.dateReception).toLocaleDateString("fr-FR"),
            "Heure": new Date(r.dateReception).toLocaleTimeString("fr-FR"),
            "Bon de Livraison": r.referenceBonLivraison,
            "Fournisseur": r.fournisseur,
            "Dépôt de chargement": r.depotChargement || "N/A",
            "BAC Destination": r.equipementDestination.nom,
            "Quantité (L)": r.quantiteRecue,
            "Densité": Number(r.densite),
            "Température (°C)": Number(r.temperature)
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Réceptions");
        XLSX.writeFile(wb, `SIGA_Receptions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    async function handleDelete(id: number) {
        if (confirm("Supprimer cette réception ? Le mouvement de stock sera annulé.")) {
            const result = await deleteReception(id);
            if (!result.success) alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Total Réceptions (mois)", value: `${data.length}`, unit: "livraisons" },
                    { label: "Volume Total Reçu", value: totalRecu.toLocaleString(), unit: "litres" },
                    { label: "Fournisseurs Actifs", value: `${new Set(data.map(r => r.fournisseur)).size}`, unit: "fournisseurs" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <PackageCheck className="text-blue-500 shrink-0" size={24} />
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
                    <h3 className="text-base font-semibold text-white">Historique des Réceptions</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
                        >
                            <Download size={16} /> Exporter
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                        >
                            <Plus size={16} /> Nouvelle Réception
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Bon Livraison</th>
                                <th className="px-5 py-3">Fournisseur</th>
                                <th className="px-5 py-3">Dépôt</th>
                                <th className="px-5 py-3">BAC Destinataire</th>
                                <th className="px-5 py-3 text-right">Quantité (L)</th>
                                <th className="px-5 py-3 text-right">Densité</th>
                                <th className="px-5 py-3 text-right">Temp. (°C)</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                                        Aucune réception enregistrée
                                    </td>
                                </tr>
                            ) : (
                                data.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-300">
                                            {new Date(r.dateReception).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                            <br />
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(r.dateReception).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-sm text-blue-400">{r.referenceBonLivraison}</td>
                                        <td className="px-5 py-3 text-sm text-slate-200 font-medium">{r.fournisseur}</td>
                                        <td className="px-5 py-3 text-sm text-slate-400 italic">{r.depotChargement || "N/A"}</td>
                                        <td className="px-5 py-3 text-sm text-slate-300">{r.equipementDestination.nom}</td>
                                        <td className="px-5 py-3 text-right font-mono text-sm text-green-400 font-bold">+{r.quantiteRecue.toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right font-mono text-sm text-slate-400">{Number(r.densite).toFixed(4)}</td>
                                        <td className="px-5 py-3 text-right font-mono text-sm text-slate-400">{Number(r.temperature).toFixed(1)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button onClick={() => handleDelete(r.id)} className="text-slate-600 hover:text-red-500 transition-colors p-1">
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer une Réception Carburant">
                <ReceptionForm bacs={bacs} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
