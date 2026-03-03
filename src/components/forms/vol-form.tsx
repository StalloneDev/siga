"use client";

import React from "react";
import { createVol } from "@/app/vols/programme/actions";

interface VolFormProps {
    compagnies: { id: number; nom: string; codeIata: string }[];
    avions: { id: number; immatriculation: string; typeAvion: { modele: string }; compagnie: { codeIata: string } }[];
    aeroports: { id: number; nom: string; codeIata: string; ville: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function VolForm({ compagnies, avions, aeroports, onSuccess, onCancel }: VolFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const fd = new FormData(e.currentTarget);
        const result = await createVol({
            numeroVol: fd.get("numeroVol") as string,
            compagnieId: parseInt(fd.get("compagnieId") as string),
            avionId: parseInt(fd.get("avionId") as string),
            aeroportArriveeId: parseInt(fd.get("aeroportArriveeId") as string),
            aeroportDepartId: parseInt(fd.get("aeroportDepartId") as string),
            dateProgrammee: selectedDate,
            heureArriveePrevue: fd.get("heureArriveePrevue") as string,
            heureDepartPrevue: fd.get("heureDepartPrevue") as string,
            quantitePrevue: parseInt(fd.get("quantitePrevue") as string) || 0,
        });
        if (result.success) onSuccess();
        else setError(result.error || "Erreur");
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>N° Vol</label>
                    <input name="numeroVol" required className={`${inputClass} font-mono uppercase`} placeholder="AF 447" />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Compagnie</label>
                    <select name="compagnieId" required className={inputClass}>
                        <option value="">Sélectionner...</option>
                        {compagnies.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.codeIata})</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Avion</label>
                <select name="avionId" required className={inputClass}>
                    <option value="">Sélectionner...</option>
                    {avions.map(a => <option key={a.id} value={a.id}>{a.immatriculation} — {a.typeAvion.modele} ({a.compagnie.codeIata})</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>Aéroport Arrivée</label>
                    <select name="aeroportArriveeId" required className={inputClass}>
                        <option value="">Sélectionner...</option>
                        {aeroports.map(a => <option key={a.id} value={a.id}>{a.codeIata} — {a.ville}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Aéroport Départ</label>
                    <select name="aeroportDepartId" required className={inputClass}>
                        <option value="">Sélectionner...</option>
                        {aeroports.map(a => <option key={a.id} value={a.id}>{a.codeIata} — {a.ville}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>Date</label>
                    <input name="dateProgrammee" type="date" required value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Heure Arrivée</label>
                    <input name="heureArriveePrevue" type="time" required className={`${inputClass} font-mono`} />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Heure Départ</label>
                    <input name="heureDepartPrevue" type="time" required className={`${inputClass} font-mono`} />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Carburant Prévu (L)</label>
                <input name="quantitePrevue" type="number" required min="0" className={`${inputClass} font-mono`} placeholder="Ex: 5000" />
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg py-2 text-sm font-bold transition-all">
                    {loading ? "Enregistrement..." : "Ajouter au Programme"}
                </button>
            </div>
        </form>
    );
}
