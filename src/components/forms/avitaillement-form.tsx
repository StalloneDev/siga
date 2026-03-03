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
        avion: { immatriculation: string; typeAvion: { modele: string; capaciteReservoir: number } };
        aeroportDepart: { codeIata: string };
        aeroportArrivee: { codeIata: string };
    }[];
    camions: { id: number; nom: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function AvitaillementForm({ vols, camions, onSuccess, onCancel }: AvitaillementFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedVolId, setSelectedVolId] = React.useState<number | "">("");
    const [selectedCamionId, setSelectedCamionId] = React.useState<number | "">("");
    const [compteurAvant, setCompteurAvant] = React.useState<number | "">("");
    const [quantite, setQuantite] = React.useState<number | "">("");
    const [dateOp, setDateOp] = React.useState(new Date().toISOString().slice(0, 16));
    const [bonAuto] = React.useState(`BL-${Date.now().toString().slice(-6)}`);

    const router = useRouter();
    const selectedVol = vols.find(v => v.id === selectedVolId);

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
        });
        if (result.success) onSuccess();
        else setError(result.error || "Erreur");
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all";
    const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest";
    const readOnlyBox = "w-full bg-slate-900/50 border border-slate-800/50 rounded-lg py-1.5 px-3 text-xs text-slate-400 font-medium min-h-[32px] flex items-center";

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
                    <select
                        name="programmeVolId" required className={`${inputClass} border-blue-500/30`}
                        value={selectedVolId} onChange={(e) => setSelectedVolId(e.target.value ? parseInt(e.target.value) : "")}
                    >
                        <option value="">Select Flight...</option>
                        {vols.map(v => <option key={v.id} value={v.id}>{v.numeroVol} — {v.compagnie.nom}</option>)}
                    </select>
                </div>
            </div>

            {/* Aircraft Details - Dense Row */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 grid grid-cols-4 gap-3">
                <div className="space-y-0.5">
                    <label className={labelClass}>Reg. Serial</label>
                    <div className={`${readOnlyBox} font-mono uppercase text-blue-400`}>{selectedVol?.avion.immatriculation || "---"}</div>
                </div>
                <div className="space-y-0.5">
                    <label className={labelClass}>Type Aircraft</label>
                    <div className={readOnlyBox}>{selectedVol?.avion.typeAvion.modele || "---"}</div>
                </div>
                <div className="space-y-0.5">
                    <label className={labelClass}>Route (From - To)</label>
                    <div className={`${readOnlyBox} font-mono justify-center gap-2 italic`}>
                        <span className="text-blue-400">{selectedVol?.aeroportDepart?.codeIata || "---"}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-purple-400">{selectedVol?.aeroportArrivee?.codeIata || "---"}</span>
                    </div>
                </div>
                <div className="space-y-0.5">
                    <label className={labelClass}>Supplied To</label>
                    <div className={readOnlyBox}>{selectedVol?.compagnie.nom || "---"}</div>
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
