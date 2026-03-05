"use client";

import React from "react";
import { Plus, Trash2, ChevronRight, Plane } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { VolForm } from "@/components/forms/vol-form";
import { updateVolStatut, deleteVol, getProgrammeVols, getDailyFuelingKPIs } from "./actions";

const STATUT_CONFIG = {
    PREVU: { label: "Prévu", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    ARRIVE: { label: "Arrivé", bg: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
    PARTI: { label: "Parti", bg: "bg-green-500/10 border-green-500/20 text-green-400" },
    ANNULE: { label: "Annulé", bg: "bg-red-500/10 border-red-500/20 text-red-400" },
};

type Statut = keyof typeof STATUT_CONFIG;

interface Vol {
    id: number;
    numeroVol: string;
    statut: Statut;
    dateProgrammee: Date;
    heureArriveePrevue: Date;
    heureDepartPrevue: Date;
    compagnie: { nom: string; codeIata: string };
    immatriculation: string;
    typeAvionManual?: string;
    typeAvion?: { modele: string; capaciteReservoir: number };
    aeroportArrivee: { codeIata: string; ville: string };
    aeroportDepart: { codeIata: string; ville: string };
    avitaillements: { quantiteLivree: number }[];
    quantitePrevue: number;
}

export function ProgrammeVolClient({
    initialData, compagnies, typeAvions, aeroports, initialKpis
}: {
    initialData: Vol[];
    compagnies: any[];
    typeAvions: any[];
    aeroports: any[];
    initialKpis: any;
}) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [data, setData] = React.useState(initialData);
    const [kpis, setKpis] = React.useState(initialKpis);

    React.useEffect(() => {
        setData(initialData);
        setKpis(initialKpis);
    }, [initialData, initialKpis]);

    // Fetch data when date changes
    React.useEffect(() => {
        async function refresh() {
            const [newVols, newKpis] = await Promise.all([
                getProgrammeVols(selectedDate),
                getDailyFuelingKPIs(selectedDate)
            ]);
            setData(newVols as any);
            setKpis(newKpis);
        }
        refresh();
    }, [selectedDate]);

    // Filter by exact date - already fetched the right ones but keep as safety or for local optimization
    const filtered = data.filter(v =>
        new Date(v.dateProgrammee).toISOString().slice(0, 10) === selectedDate
    );

    async function handleStatutChange(id: number, statut: Statut) {
        await updateVolStatut(id, statut);
    }

    async function handleDelete(id: number) {
        if (confirm("Supprimer ce vol du programme ?")) {
            const res = await deleteVol(id);
            if (!res.success) alert(res.error);
        }
    }

    return (
        <div className="space-y-8">
            {/* DAILY AVIATION FUELING PROGRAM - KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-0 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900/60 p-4 border-r border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center font-mono">Total Opening Stock</div>
                    <div className="text-xl font-mono font-bold text-white text-center">
                        {kpis.totalOpeningStock.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">L</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 p-4 border-r border-slate-800">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 text-center font-mono">Security Stock</div>
                    <div className="text-xl font-mono font-bold text-red-400 text-center">
                        {kpis.securityStock.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">L</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 p-4 border-r border-slate-800">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1 text-center font-mono">Avail. Deliv. Opening</div>
                    <div className="text-xl font-mono font-bold text-blue-400 text-center">
                        {kpis.availableDelivery.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">L</span>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-4 border-r border-slate-800">
                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1 text-center font-mono">Today's Replenishment</div>
                    <div className="text-xl font-mono font-bold text-purple-400 text-center">
                        {kpis.todayReceptions.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">L</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 p-4 border-r border-slate-800">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 text-center font-mono">Uplift Qty Forecast</div>
                    <div className="text-xl font-mono font-bold text-amber-500 text-center">
                        {kpis.upliftForecast.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">L</span>
                    </div>
                </div>
                <div className="bg-red-950/20 p-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center font-mono">Theoric Closing Stock</div>
                    <div className={`text-xl font-mono font-bold text-center ${kpis.theoreticalClosing < 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                        {kpis.theoreticalClosing.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">L</span>
                    </div>
                </div>
            </div>

            {/* Date Selector + Add Button */}
            <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Jour :</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 font-mono"
                    />
                </div>
                <span className="text-slate-500 text-sm border-l border-slate-800 pl-4">{filtered.length} vol(s) programmé(s) pour ce jour</span>
                <div className="ml-auto">
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                        <Plus size={16} /> Ajouter un Vol
                    </button>
                </div>
            </div>

            {/* Flights Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">N° Vol</th>
                                <th className="px-5 py-3">Compagnie</th>
                                <th className="px-5 py-3">Avion</th>
                                <th className="px-5 py-3">Arrivée</th>
                                <th className="px-5 py-3">Départ</th>
                                <th className="px-5 py-3 text-right">ETA/ETD</th>
                                <th className="px-5 py-3 text-right">Carburant prévu</th>
                                <th className="px-5 py-3">Statut</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <Plane size={32} className="opacity-30" />
                                            <p>Aucun vol programmé pour ce jour</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered
                                    .sort((a, b) => new Date(a.heureArriveePrevue).getTime() - new Date(b.heureArriveePrevue).getTime())
                                    .map(vol => {
                                        const conf = STATUT_CONFIG[vol.statut];
                                        const avitaille = vol.avitaillements.reduce((s, a) => s + a.quantiteLivree, 0);
                                        return (
                                            <tr key={vol.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="px-5 py-3 font-mono text-sm text-slate-400">
                                                    {new Date(vol.dateProgrammee).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                                                </td>
                                                <td className="px-5 py-3 font-mono text-sm font-bold text-white">{vol.numeroVol}</td>
                                                <td className="px-5 py-3 text-sm text-slate-300">{vol.compagnie.nom}</td>
                                                <td className="px-5 py-3">
                                                    <div className="text-sm font-bold text-blue-400">{vol.immatriculation}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">{vol.typeAvionManual || vol.typeAvion?.modele || "N/A"}</div>
                                                </td>
                                                <td className="px-5 py-3 font-mono text-sm text-blue-400">{vol.aeroportArrivee.codeIata}</td>
                                                <td className="px-5 py-3 font-mono text-sm text-purple-400">{vol.aeroportDepart.codeIata}</td>
                                                <td className="px-5 py-3 text-right font-mono text-xs text-slate-400">
                                                    {new Date(vol.heureArriveePrevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                    {" / "}
                                                    {new Date(vol.heureDepartPrevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="text-sm font-mono text-amber-400">
                                                        {vol.quantitePrevue > 0 ? `${vol.quantitePrevue.toLocaleString()} L` : "Non définie"}
                                                    </div>
                                                    {avitaille > 0 && <div className="text-[10px] text-green-500 font-bold">✓ {avitaille.toLocaleString()} L livré</div>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={vol.statut}
                                                        onChange={e => handleStatutChange(vol.id, e.target.value as Statut)}
                                                        className={`text-[10px] font-bold rounded-full border px-2.5 py-1 cursor-pointer bg-transparent ${conf.bg}`}
                                                    >
                                                        {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                                                            <option key={k} value={k} className="bg-slate-900 text-slate-200">{v.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <button onClick={() => handleDelete(vol.id)} className="text-slate-600 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-900 border-t-2 border-slate-800">
                                    <td colSpan={7} className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Total Forecast Uplift</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="text-lg font-mono font-bold text-amber-500">
                                            {filtered.reduce((sum, v) => sum + v.quantitePrevue, 0).toLocaleString()} L
                                        </div>
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter au Programme de Vol">
                <VolForm compagnies={compagnies} typeAvions={typeAvions} aeroports={aeroports} onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
