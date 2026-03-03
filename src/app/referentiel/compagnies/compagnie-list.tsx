"use client";

import React from "react";
import { Plus, Trash2, ShieldCheck, ShieldAlert, Globe, Download, Upload, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { CompagnieForm } from "@/components/forms/compagnie-form";
import { deleteCompagnie, toggleCompagnieStatus } from "./actions";
import { bulkImportCompagnies } from "../bulk-actions";
import * as XLSX from "xlsx";

interface Compagnie {
    id: number;
    nom: string;
    codeIata: string;
    codeIcao: string;
    pays: string;
    actif: boolean;
}

export function CompagnieList({ initialData }: { initialData: Compagnie[] }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [data, setData] = React.useState(initialData);

    // Sync with initialData if it changes from server
    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    async function handleDelete(id: number) {
        if (confirm("Supprimer cette compagnie ?")) {
            const result = await deleteCompagnie(id);
            if (!result.success) alert(result.error);
        }
    }

    async function handleToggle(id: number, status: boolean) {
        await toggleCompagnieStatus(id, status);
    }

    const handleExport = () => {
        const exportData = data.map(c => ({
            "Nom": c.nom,
            "Code IATA": c.codeIata,
            "Code ICAO": c.codeIcao,
            "Pays": c.pays,
            "Status": c.actif ? "Actif" : "Inactif"
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Compagnies");
        XLSX.writeFile(wb, "SIGA_Referentiel_Compagnies.xlsx");
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            { "nom": "Exemple Air", "codeIata": "EA", "codeIcao": "EXA", "pays": "Benin" }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Modele_Import_Compagnies.xlsx");
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
                const result = await bulkImportCompagnies(items);
                if (result.success) {
                    alert(`${items.length} compagnies importées avec succès.`);
                    window.location.reload();
                } else {
                    alert("Erreur lors de l'importation : " + result.error);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-end gap-3">
                <input
                    type="file"
                    id="import-excel"
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
                    onClick={() => document.getElementById('import-excel')?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all"
                >
                    <Upload size={18} />
                    Importer (Excel)
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
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                    <Plus size={18} />
                    Ajouter une compagnie
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                        <Globe size={48} className="text-slate-700 mb-4" />
                        <p className="text-slate-400 font-medium">Aucune compagnie enregistrée</p>
                    </div>
                ) : (
                    data.map((compagnie) => (
                        <div
                            key={compagnie.id}
                            className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl group hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {compagnie.codeIata}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold tracking-tight">{compagnie.nom}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{compagnie.pays}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle(compagnie.id, compagnie.actif)}
                                    className={`p-1 rounded-md transition-colors ${compagnie.actif ? "text-green-500 hover:bg-green-500/10" : "text-slate-600 hover:bg-slate-800"}`}
                                >
                                    {compagnie.actif ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50 mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IATA</p>
                                    <p className="text-sm font-mono text-slate-200">{compagnie.codeIata}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ICAO</p>
                                    <p className="text-sm font-mono text-slate-200">{compagnie.codeIcao}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${compagnie.actif
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-slate-800 text-slate-500 border-slate-700"
                                    }`}>
                                    {compagnie.actif ? "ACTIF" : "INACTIF"}
                                </span>
                                <button
                                    onClick={() => handleDelete(compagnie.id)}
                                    className="text-slate-600 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nouvelle Compagnie Aérienne"
            >
                <CompagnieForm
                    onSuccess={() => {
                        setIsModalOpen(false);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
