"use client";

import React from "react";
import { Plus, Trash2, Fuel, Truck, Download, Upload, FileText, Edit2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { EquipementForm } from "@/components/forms/equipement-form";
import { deleteEquipement } from "./actions";
import { EquipementType } from "@prisma/client";
import { bulkImportEquipements } from "../bulk-actions";
import * as XLSX from "xlsx";

interface Equipement {
    id: number;
    nom: string;
    typeEquipement: EquipementType;
    capaciteMaximale: number;
    stockInitial: number;
    seuilAlerte: number;
}

export function EquipementList({ initialData }: { initialData: Equipement[] }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedEquipement, setSelectedEquipement] = React.useState<Equipement | null>(null);
    const [data, setData] = React.useState(initialData);

    React.useEffect(() => { setData(initialData); }, [initialData]);

    const handleEdit = (eq: Equipement) => {
        setSelectedEquipement(eq);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedEquipement(null);
        setIsModalOpen(true);
    };

    async function handleDelete(id: number) {
        if (confirm("Supprimer cet équipement ?")) {
            const result = await deleteEquipement(id);
            if (!result.success) alert(result.error);
        }
    }

    const handleExport = () => {
        const exportData = data.map(eq => ({
            "Nom": eq.nom,
            "Type": eq.typeEquipement,
            "Capacité Maximale (L)": eq.capaciteMaximale,
            "Stock Initial (L)": eq.stockInitial,
            "Seuil Alerte": eq.seuilAlerte
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Equipements");
        XLSX.writeFile(wb, "SIGA_Referentiel_Equipements.xlsx");
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
                const plainItems = JSON.parse(JSON.stringify(items));
                const result = await bulkImportEquipements(plainItems) as any;
                if (result.success) {
                    alert(`${result.count} équipements importés (${result.total} traités).`);
                    window.location.reload();
                } else {
                    alert("Erreur lors de l'importation : " + result.error);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            { "nom": "Cuve 01", "typeEquipement": "BAC", "capaciteMaximale": 50000, "stockInitial": 10000, "seuilAlerte": 5000 },
            { "nom": "Camion A1", "typeEquipement": "CAMION", "capaciteMaximale": 20000, "stockInitial": 0, "seuilAlerte": 2000 }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Modele_Import_Equipements.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-end gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleImport}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                />
                <button
                    onClick={handleDownloadTemplate}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 border border-slate-700 transition-all"
                >
                    <FileText size={18} />
                    Modèle
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
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
                <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                    <Plus size={18} /> Ajouter un équipement
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                        Aucun équipement enregistré
                    </div>
                ) : (
                    data.map((eq) => (
                        <div key={eq.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl group hover:border-slate-700 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${eq.typeEquipement === "BAC" ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white" : "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white"}`}>
                                        {eq.typeEquipement === "BAC" ? <Fuel size={24} /> : <Truck size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold tracking-tight">{eq.nom}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{eq.typeEquipement === "BAC" ? "Cuve Fixe" : "Avitailleur"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 py-4 border-y border-slate-800/50 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Capacité Max</p>
                                        <p className="text-sm font-mono text-slate-200">{eq.capaciteMaximale.toLocaleString()} L</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stock Initial</p>
                                        <p className="text-sm font-mono text-slate-200">{eq.stockInitial.toLocaleString()} L</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(eq)} className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded-md hover:bg-slate-800">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(eq.id)} className="text-slate-600 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-800">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEquipement ? "Modifier l'équipement" : "Nouvel Équipement"}>
                <EquipementForm 
                    initialData={selectedEquipement as any}
                    onSuccess={() => setIsModalOpen(false)} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
}
