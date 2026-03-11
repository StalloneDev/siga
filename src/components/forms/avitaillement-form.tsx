"use client";

import React from "react";
import { createAvitaillement, getLastCounter } from "@/app/vols/avitaillement/actions";
import { Calculator, Plane, User, Hash } from "lucide-react";
import { useRouter } from "next/navigation";

interface AvitaillementFormProps {
    vols: {
        id: number;
        numeroVol: string;
        compagnie: { nom: string };
        immatriculation: string;
        typeAvionId: number;
        typeAvion: { modele: string; capaciteReservoir: number };
        aeroportDepart: { codeIata: string };
        aeroportArrivee: { codeIata: string };
    }[];
    camions: { id: number; nom: string }[];
    typeAvions: { id: number; modele: string; constructeur: string }[];
    compagnies: { id: number; nom: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function AvitaillementForm({ vols, camions, typeAvions, compagnies, onSuccess, onCancel }: AvitaillementFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedVolId, setSelectedVolId] = React.useState<number | "">("");
    const [selectedCamionId, setSelectedCamionId] = React.useState<number | "">("");
    const [compteurAvant, setCompteurAvant] = React.useState<number | "">("");
    const [quantite, setQuantite] = React.useState<number | "">("");
    const [dateOp, setDateOp] = React.useState(new Date().toISOString().slice(0, 16));
    const [bonAuto] = React.useState(`BL-${Date.now().toString().slice(-6)}`);

    // Override states
    const [immatriculation, setImmatriculation] = React.useState("");
    const [typeAvionManual, setTypeAvionManual] = React.useState("");
    const [routeFrom, setRouteFrom] = React.useState("");
    const [routeTo, setRouteTo] = React.useState("");
    const [suppliedTo, setSuppliedTo] = React.useState("");

    const router = useRouter();
    const selectedVol = vols.find(v => v.id === selectedVolId);

    // Sync overrides with selected flight
    React.useEffect(() => {
        if (selectedVol) {
            setImmatriculation(selectedVol.immatriculation);
            setTypeAvionManual(selectedVol.typeAvion.modele);
            setRouteFrom(selectedVol.aeroportDepart?.codeIata || "");
            setRouteTo(selectedVol.aeroportArrivee?.codeIata || "");
            setSuppliedTo(selectedVol.compagnie.nom);
        } else {
            setImmatriculation("");
            setTypeAvionManual("");
            setRouteFrom("");
            setRouteTo("");
            setSuppliedTo("");
        }
    }, [selectedVolId, vols]);

    // Robust reactive calculation: we calculate as soon as we have a quantity
    const quantiteVal = typeof quantite === 'number' ? quantite : 0;
    const avantVal = typeof compteurAvant === 'number' ? compteurAvant : 0;
    const showCalculations = quantite !== "" && quantite > 0;
    const computedApres = showCalculations ? avantVal + quantiteVal : null;

    React.useEffect(() => {
        if (selectedCamionId) {
            getLastCounter(selectedCamionId as number).then(setCompteurAvant);
        } else {
            setCompteurAvant("");
        }
    }, [selectedCamionId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const fd = new FormData(e.currentTarget);
        const result = await createAvitaillement({
            programmeVolId: parseInt(fd.get("programmeVolId") as string),
            camionId: parseInt(fd.get("camionId") as string),
            quantiteLivree: quantite as number,
            numeroBonLivraison: fd.get("numeroBonLivraison") as string,
            dateOperation: dateOp,
            immatriculation: immatriculation,
            typeAvionManual: typeAvionManual,
            routeFrom: routeFrom,
            routeTo: routeTo,
            suppliedTo: suppliedTo,
        });
        if (result.success) onSuccess();
        else setError(result.error || "Erreur");
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all";
    const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest";
    const editableBox = "w-full bg-slate-900/80 border border-slate-700 rounded-lg py-1 px-2 text-xs text-white focus:border-blue-500 transition-all";

    return (
        <form onSubmit={handleSubmit} className="p-1 space-y-3">
            {error && <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[10px] font-medium">{error}</div>}

            {/* Header: Date, BL, Flight in one row */}
            <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3 space-y-1">
                    <label className={labelClass}>Date & Time</label>
                    <input type="datetime-local" required value={dateOp} onChange={e => setDateOp(e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-3 space-y-1">
                    <label className={labelClass}>Note No. (BL)</label>
                    <input name="numeroBonLivraison" required defaultValue={bonAuto} className={`${inputClass} font-mono uppercase bg-slate-900/50`} />
                </div>
                <div className="col-span-6 space-y-1">
                    <label className={labelClass}>Flight N° & Compagnie</label>
                    <input
                        type="text"
                        placeholder="Search or type flight..."
                        required
                        className={`${inputClass} border-blue-500/30`}
                        list="vols-datalist"
                        autoComplete="off"
                        defaultValue={selectedVol ? `${selectedVol.numeroVol} — ${selectedVol.compagnie.nom}` : ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            const found = vols.find(v => 
                                v.numeroVol === val || 
                                `${v.numeroVol} — ${v.compagnie.nom}` === val
                            );
                            if (found) setSelectedVolId(found.id);
                            else setSelectedVolId("");
                        }}
                    />
                    <datalist id="vols-datalist">
                        {vols.map(v => (
                            <option key={v.id} value={`${v.numeroVol} — ${v.compagnie.nom}`} />
                        ))}
                    </datalist>
                    <input type="hidden" name="programmeVolId" value={selectedVolId} />
                </div>
            </div>

            {/* Aircraft Details & Route - Interactive Inputs */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className={labelClass}>Reg. Serial</label>
                        <div className="relative group">
                            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                            <input
                                value={immatriculation}
                                onChange={e => setImmatriculation(e.target.value.toUpperCase())}
                                placeholder="Reg."
                                className={`${editableBox} pl-8 font-mono text-blue-400 !py-2`}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Type Aircraft</label>
                        <div className="relative group">
                            <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                            <input
                                value={typeAvionManual}
                                onChange={e => setTypeAvionManual(e.target.value.toUpperCase())}
                                placeholder="Select Type..."
                                className={`${editableBox} pl-8 !py-2 uppercase font-medium`}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Route (From - To)</label>
                        <div className="flex items-center gap-1 group">
                            <div className="relative w-1/2">
                                <input
                                    value={routeFrom}
                                    onChange={e => setRouteFrom(e.target.value.toUpperCase())}
                                    placeholder="FR"
                                    className={`${editableBox} font-mono text-center !py-2 border-blue-500/20 focus:border-blue-500`}
                                    maxLength={4}
                                />
                            </div>
                            <span className="text-slate-600 font-black px-1 scale-125 select-none">→</span>
                            <div className="relative w-1/2">
                                <input
                                    value={routeTo}
                                    onChange={e => setRouteTo(e.target.value.toUpperCase())}
                                    placeholder="TO"
                                    className={`${editableBox} font-mono text-center !py-2 border-purple-500/20 focus:border-purple-500`}
                                    maxLength={4}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Supplied To</label>
                        <div className="relative group">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                            <input
                                value={suppliedTo}
                                onChange={e => setSuppliedTo(e.target.value)}
                                placeholder="Compagnie"
                                className={`${editableBox} pl-8 !py-2 font-semibold`}
                                list="compagnies-list"
                            />
                            <datalist id="compagnies-list">
                                {compagnies.map(c => <option key={c.id} value={c.nom} />)}
                            </datalist>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operations - The Calculation Row */}
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-3 shadow-inner">
                <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Truck */}
                    <div className="col-span-3 space-y-1">
                        <label className={labelClass}>Truck N°</label>
                        <select
                            name="camionId" required className={`${inputClass} bg-slate-900 h-10`}
                            value={selectedCamionId} onChange={(e) => setSelectedCamionId(e.target.value ? parseInt(e.target.value) : "")}
                        >
                            <option value="">Select Truck...</option>
                            {camions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                        </select>
                    </div>

                    {/* Quantity To Add */}
                    <div className="col-span-3 space-y-1">
                        <label className={`${labelClass} text-blue-400`}>Quantity to Deliver (L)</label>
                        <input
                            type="number" required min="1"
                            value={quantite}
                            onChange={e => setQuantite(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full bg-blue-600/10 border border-blue-500/50 rounded-lg h-10 px-3 text-lg font-mono font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                            placeholder="0"
                        />
                    </div>

                    {/* Meters Section */}
                    <div className="col-span-6 grid grid-cols-2 gap-3">
                        {/* Meter Before */}
                        <div className="space-y-1">
                            <label className={labelClass}>Meter Before</label>
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg h-10 flex items-center justify-center font-mono font-bold text-slate-400">
                                {selectedCamionId ? avantVal.toLocaleString() : "---"} <span className="ml-1 text-[10px] opacity-50">L</span>
                            </div>
                        </div>

                        {/* Meter After */}
                        <div className="space-y-1">
                            <label className={`${labelClass} text-blue-400`}>Meter After</label>
                            <div className="h-10 transition-all duration-300">
                                {showCalculations ? (
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg h-full flex items-center justify-center font-mono font-bold text-blue-500 animate-in fade-in slide-in-from-right-2">
                                        {computedApres?.toLocaleString()} <span className="ml-1 text-[10px] opacity-70">L</span>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-slate-800 rounded-lg h-full flex items-center justify-center opacity-20">
                                        <span className="text-[10px] text-slate-600 italic">Wait...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-500 hover:text-white transition-colors">Cancel</button>
                <button
                    type="submit"
                    disabled={loading || selectedCamionId === "" || selectedVolId === "" || computedApres === null}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg py-2.5 text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? "Recording..." : <>Complete & Save Fueling <span className="opacity-50 text-xs font-normal">(BL: {bonAuto})</span></>}
                </button>
            </div>
        </form >
    );
}
