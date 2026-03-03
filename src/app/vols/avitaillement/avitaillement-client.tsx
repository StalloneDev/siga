"use client";

import React from "react";
import { Plus, Fuel, Download, Printer } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AvitaillementForm } from "@/components/forms/avitaillement-form";
import { BonLivraison } from "@/components/ui/bon-livraison";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

interface Avitaillement {
    id: number;
    numeroBonLivraison: string;
    quantiteLivree: number;
    compteurAvant: bigint;
    compteurApres: bigint;
    dateOperation: Date;
    programmeVol: {
        numeroVol: string;
        compagnie: { nom: string };
        avion: { immatriculation: string; typeAvion: { modele: string } };
        aeroportDepart?: { codeIata: string };
        aeroportArrivee?: { codeIata: string };
    };
    camion: { nom: string };
}

export function AvitaillementClient({
    initialData, vols, camions,
}: {
    initialData: Avitaillement[];
    vols: any[];
    camions: any[];
}) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedAvitaillement, setSelectedAvitaillement] = React.useState<Avitaillement | null>(null);
    const [data, setData] = React.useState(initialData);

    const componentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: selectedAvitaillement ? `Bon_Livraison_${selectedAvitaillement.numeroBonLivraison}` : "Bon_Livraison",
    });

    const triggerPrint = (avitaillement: Avitaillement) => {
        setSelectedAvitaillement(avitaillement);
        // We need a small delay to let state update before printing if using old react-to-print, 
        // but with contentRef it usually handles it.
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const totalLivre = data.reduce((s, a) => s + a.quantiteLivree, 0);

    const handleExport = () => {
        const exportData = data.map(a => ({
            "Date": new Date(a.dateOperation).toLocaleDateString("fr-FR"),
            "Heure": new Date(a.dateOperation).toLocaleTimeString("fr-FR"),
            "Bon N°": a.numeroBonLivraison,
            "N° Vol": a.programmeVol.numeroVol,
            "Compagnie": a.programmeVol.compagnie.nom,
            "Immatriculation": a.programmeVol.avion.immatriculation,
            "Modèle Avion": a.programmeVol.avion.typeAvion.modele,
            "Camion": a.camion.nom,
            "Compteur Avant": Number(a.compteurAvant),
            "Compteur Après": Number(a.compteurApres),
            "Quantité Livrée (L)": a.quantiteLivree
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Avitaillements");
        XLSX.writeFile(wb, `SIGA_Avitaillements_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Avitaillements réalisés", value: data.length.toString(), unit: "opérations" },
                    { label: "Volume Total Livré", value: totalLivre.toLocaleString(), unit: "litres" },
                    { label: "Bons de Livraison", value: data.length.toString(), unit: "bons" },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <Fuel className="text-blue-500 shrink-0" size={24} />
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
                    <h3 className="text-base font-semibold text-white">Historique des Avitaillements</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
                        >
                            <Download size={16} /> Exporter
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                            <Plus size={16} /> Nouvel Avitaillement
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Bon N°</th>
                                <th className="px-5 py-3">N° Vol</th>
                                <th className="px-5 py-3">Avion</th>
                                <th className="px-5 py-3">Camion</th>
                                <th className="px-5 py-3 text-right">Cpt. Avant</th>
                                <th className="px-5 py-3 text-right">Cpt. Après</th>
                                <th className="px-5 py-3 text-right">Livré (L)</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">Aucun avitaillement enregistré</td></tr>
                            ) : (
                                data.map(a => (
                                    <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-300">
                                            {new Date(a.dateOperation).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                                            {" "}
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {new Date(a.dateOperation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-sm text-blue-400">{a.numeroBonLivraison}</td>
                                        <td className="px-5 py-3 font-mono text-sm font-bold text-white">{a.programmeVol.numeroVol}</td>
                                        <td className="px-5 py-3 text-sm text-slate-300">
                                            <div>{a.programmeVol.avion.immatriculation}</div>
                                            <div className="text-[10px] text-slate-500">{a.programmeVol.avion.typeAvion.modele}</div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-cyan-400">{a.camion.nom}</td>
                                        <td className="px-5 py-3 text-right font-mono text-xs text-slate-400">{Number(a.compteurAvant).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right font-mono text-xs text-slate-400">{Number(a.compteurApres).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right font-mono text-sm text-green-400 font-bold">{a.quantiteLivree.toLocaleString()}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => triggerPrint(a)}
                                                className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                                                title="Imprimer Bon de Livraison"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden Printable Component */}
            <div className="hidden">
                {selectedAvitaillement && (
                    <BonLivraison ref={componentRef} avitaillement={selectedAvitaillement} />
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvel Avitaillement" maxWidth="4xl">
                <AvitaillementForm vols={vols} camions={camions} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
