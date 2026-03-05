"use client";

import React, { useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import * as XLSX from "xlsx";

interface RapportListProps {
    initialData: any[];
}

export function RapportList({ initialData }: RapportListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const filteredData = initialData.filter(item => {
        const matchesSearch =
            item.programmeVol?.compagnie?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.programmeVol?.numeroVol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.numeroBonLivraison?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = !dateFilter || new Date(item.dateOperation).toISOString().split('T')[0] === dateFilter;

        return matchesSearch && matchesDate;
    });

    const handleExport = () => {
        const exportData = filteredData.map(item => ({
            "Date": new Date(item.dateOperation).toLocaleDateString("fr-FR"),
            "Supplied To": item.suppliedTo || item.programmeVol?.compagnie?.nom || "N/A",
            "Registred Serial N°": item.immatriculation || item.programmeVol?.immatriculation || "N/A",
            "Flight N°": item.programmeVol?.numeroVol || "N/A",
            "Type Aircraft": item.typeAvionManual || item.typeAvion?.modele || item.programmeVol?.typeAvion?.modele || "N/A",
            "Arrived From": item.routeFrom || item.programmeVol?.aeroportDepart?.codeIata || "N/A",
            "Proceeding To": item.routeTo || item.programmeVol?.aeroportArrivee?.codeIata || "N/A",
            "Delivery Note No.": item.numeroBonLivraison || "N/A",
            "Meter Before": Number(item.compteurAvant),
            "Meter After": Number(item.compteurApres),
            "Quantity Delivered (L)": item.quantiteLivree,
            "Truck N°": item.camion?.nom || "N/A"
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Styling columns width
        const wscols = [
            { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rapport de Vente");
        XLSX.writeFile(wb, `Rapport_Vente_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher (Compagnie, Vol, BL)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                        <Filter size={16} className="text-slate-500" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        <Download size={18} /> Exporter Excel
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Supplied To</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Registred Serial N°</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Flight N°</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type Aircraft</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Arrived From</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Proceeding To</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Note No.</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Meter Before</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Meter After</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Quantity (L)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Truck N°</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4 text-sm text-slate-300 font-medium">
                                            {new Date(item.dateOperation).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-white text-center">
                                            {item.suppliedTo || item.programmeVol?.compagnie?.nom || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm text-blue-400 font-mono text-center">
                                            {item.immatriculation || item.programmeVol?.immatriculation || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-300 font-bold text-center">
                                            {item.programmeVol?.numeroVol || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 text-center">
                                            {item.typeAvionManual || item.typeAvion?.modele || item.programmeVol?.typeAvion?.modele || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-300 text-center">
                                            {item.routeFrom || item.programmeVol?.aeroportDepart?.codeIata || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-300 text-center">
                                            {item.routeTo || item.programmeVol?.aeroportArrivee?.codeIata || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm text-blue-400 font-medium text-center">
                                            {item.numeroBonLivraison || "N/A"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 font-mono text-right">
                                            {Number(item.compteurAvant).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 font-mono text-right">
                                            {Number(item.compteurApres).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm font-black text-white text-right">
                                            {item.quantiteLivree.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 text-center">
                                            <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                                {item.camion?.nom || "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="p-12 text-center text-slate-500 italic">
                                        Aucune donnée trouvée pour les filtres sélectionnés.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-950/30 border-t border-slate-800">
                            <tr>
                                <td colSpan={10} className="p-4 text-right text-xs font-bold text-slate-500 uppercase">
                                    Total Général :
                                </td>
                                <td className="p-4 text-sm font-black text-blue-400 text-right">
                                    {filteredData.reduce((sum, item) => sum + item.quantiteLivree, 0).toLocaleString()} L
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
