"use client";

import React from "react";
import { Plus, Trash2, Plane, Settings2, Download, Upload, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { deleteAvion } from "./actions";
import { AvionForm } from "@/components/forms/avion-form";
import { TypeAvionForm } from "@/components/forms/type-avion-form";
import { bulkImportAvions, bulkImportTypeAvions } from "../bulk-actions";
import * as XLSX from "xlsx";

interface TypeAvion {
    id: number;
    constructeur: string;
    modele: string;
    codeIata: string;
    capaciteReservoir: number;
}

interface Avion {
    id: number;
    immatriculation: string;
    typeAvion: TypeAvion;
    compagnie: { nom: string };
    actif: boolean;
}

export function AvionManager({
    initialAvions,
    initialTypes,
    compagnies
}: {
    initialAvions: any[],
    initialTypes: any[],
    compagnies: any[]
}) {
    const [activeTab, setActiveTab] = React.useState<"avions" | "types">("avions");
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleExport = () => {
        let exportData: any[] = [];
        let fileName = "";

        if (activeTab === "avions") {
            exportData = initialAvions.map(a => ({
                "Immatriculation": a.immatriculation,
                "Modèle": `${a.typeAvion.constructeur} ${a.typeAvion.modele}`,
                "Compagnie": a.compagnie.nom,
                "Status": a.actif ? "Actif" : "Inactif"
            }));
            fileName = "SIGA_Flotte_Avions.xlsx";
        } else {
            exportData = initialTypes.map(t => ({
                "Constructeur": t.constructeur,
                "Modèle": t.modele,
                "IATA": t.codeIata,
                "ICAO": t.codeIcao,
                "Capacité": t.capaciteReservoir
            }));
            fileName = "SIGA_Modeles_Avions.xlsx";
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab === "avions" ? "Avions" : "Modeles");
        XLSX.writeFile(wb, fileName);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const items = XLSX.utils.sheet_to_json(ws);

            if (items.length > 0) {
                const result = activeTab === "avions"
                    ? await bulkImportAvions(items)
                    : await bulkImportTypeAvions(items);

                if (result.success) {
                    alert(`${items.length} éléments importés avec succès.`);
                    window.location.reload();
                } else {
                    alert("Erreur lors de l'importation : " + result.error);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        let templateData: any[] = [];
        let fileName = "";

        if (activeTab === "avions") {
            templateData = [
                { "immatriculation": "5V-AAA", "compagnieId": 1, "typeAvionId": 1 }
            ];
            fileName = "Modele_Import_Avions.xlsx";
        } else {
            templateData = [
                { "constructeur": "Boeing", "modele": "737-800", "codeIata": "73H", "codeIcao": "B738", "capaciteReservoir": 26000 }
            ];
            fileName = "Modele_Import_Modeles_Avions.xlsx";
        }

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab("avions")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "avions" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        Flotte Active
                    </button>
                    <button
                        onClick={() => setActiveTab("types")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "types" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        Modèles d'Avions
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="import-excel-avion"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleImport}
                    />
                    <button
                        onClick={handleDownloadTemplate}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all"
                    >
                        <FileText size={18} />
                        Modèle
                    </button>
                    <button
                        onClick={() => document.getElementById('import-excel-avion')?.click()}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all"
                    >
                        <Upload size={18} />
                        Importer
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all"
                    >
                        <Download size={18} />
                        Exporter
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 shadow-blue-900/20"
                    >
                        <Plus size={18} />
                        {activeTab === "avions" ? "Ajouter un avion" : "Nouveau modèle"}
                    </button>
                </div>
            </div>

            {activeTab === "avions" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {initialAvions.map((avion) => (
                        <div key={avion.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl group hover:border-slate-700 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-mono font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Plane size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold tracking-tight">{avion.immatriculation}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{avion.compagnie.nom}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="py-4 border-y border-slate-800/50 mb-4 space-y-2">
                                <p className="text-sm text-slate-300">Modèle: <span className="text-white font-medium">{avion.typeAvion.constructeur} {avion.typeAvion.modele}</span></p>
                                <p className="text-sm text-slate-300">Capacité: <span className="text-white font-medium">{avion.typeAvion.capaciteReservoir.toLocaleString()} L</span></p>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={async () => { if (confirm("Supprimer ?")) await deleteAvion(avion.id); }} className="text-slate-600 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {initialTypes.map((type) => (
                        <div key={type.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-all">
                                    <Settings2 size={20} />
                                </div>
                                <h4 className="text-white font-bold tracking-tight">{type.constructeur} {type.modele}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><p className="text-slate-500 font-bold uppercase">IATA/ICAO</p><p className="text-slate-200">{type.codeIata} / {type.codeIcao}</p></div>
                                <div><p className="text-slate-500 font-bold uppercase">Réservoir</p><p className="text-slate-200">{type.capaciteReservoir.toLocaleString()} L</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={activeTab === "avions" ? "Enregistrer un Avion" : "Créer un Modèle d'Avion"}
            >
                {activeTab === "avions" ? (
                    <AvionForm
                        compagnies={compagnies}
                        types={initialTypes}
                        onSuccess={() => setIsModalOpen(false)}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : (
                    <TypeAvionForm
                        onSuccess={() => setIsModalOpen(false)}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
