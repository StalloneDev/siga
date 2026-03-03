"use client";

import React from "react";
import { createTransfert } from "@/app/logistique/transfert/actions";
import { ArrowRight } from "lucide-react";

interface Equipement {
    id: number;
    nom: string;
    capaciteMaximale: number;
}

interface TransfertFormProps {
    bacs: Equipement[];
    camions: Equipement[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function TransfertForm({ bacs, camions, onSuccess, onCancel }: TransfertFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedSource, setSelectedSource] = React.useState<number | null>(null);
    const [selectedDest, setSelectedDest] = React.useState<number | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);

        const result = await createTransfert({
            equipementSourceId: parseInt(formData.get("equipementSourceId") as string),
            equipementDestinationId: parseInt(formData.get("equipementDestinationId") as string),
            quantiteTransferee: parseInt(formData.get("quantiteTransferee") as string),
            referenceTransfert: formData.get("referenceTransfert") as string,
            dateTransfert: formData.get("dateTransfert") as string,
        });

        if (result.success) onSuccess();
        else setError(result.error || "Une erreur est survenue.");
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    const sourceName = bacs.find(b => b.id === selectedSource)?.nom;
    const destName = camions.find(c => c.id === selectedDest)?.nom;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            {/* Visual transfer indicator */}
            {(sourceName || destName) && (
                <div className="flex items-center justify-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-sm">
                    <span className="text-blue-400 font-mono">{sourceName || "BAC ?"}</span>
                    <ArrowRight size={16} className="text-slate-500 shrink-0" />
                    <span className="text-cyan-400 font-mono">{destName || "Camion ?"}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>BAC Source</label>
                    <select name="equipementSourceId" required className={inputClass} onChange={e => setSelectedSource(parseInt(e.target.value || "0"))}>
                        <option value="">Sélectionner...</option>
                        {bacs.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Camion Destination</label>
                    <select name="equipementDestinationId" required className={inputClass} onChange={e => setSelectedDest(parseInt(e.target.value || "0"))}>
                        <option value="">Sélectionner...</option>
                        {camions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>Quantité (L)</label>
                    <input name="quantiteTransferee" type="number" required min="1" className={`${inputClass} font-mono`} placeholder="30000" />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Réf. Transfert</label>
                    <input name="referenceTransfert" required className={`${inputClass} font-mono uppercase`} placeholder="TRF-2025-00001" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Date & Heure du Transfert</label>
                <input name="dateTransfert" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} className={inputClass} />
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg py-2 text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                    {loading ? "Enregistrement..." : "Valider le Transfert"}
                </button>
            </div>
        </form>
    );
}
