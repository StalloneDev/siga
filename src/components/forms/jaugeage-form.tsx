"use client";

import React from "react";
import { createJaugeage } from "@/app/logistique/jaugeage/actions";

interface JaugeageFormProps {
    equipements: { id: number; nom: string; typeEquipement: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function JaugeageForm({ equipements, onSuccess, onCancel }: JaugeageFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [result, setResult] = React.useState<{ ecart: number; stockTheorique: number } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        const fd = new FormData(e.currentTarget);
        const volume = parseInt(fd.get("volumeMesure") as string);
        const res = await createJaugeage({
            equipementId: parseInt(fd.get("equipementId") as string),
            dateJaugeage: fd.get("dateJaugeage") as string,
            valeurDipMm: volume, // Use volume for both as requested
            temperature: parseFloat(fd.get("temperature") as string),
            volumeMesure: volume,
        });
        if (res.success) {
            setResult({ ecart: res.ecart!, stockTheorique: res.stockTheorique! });
        } else {
            setError(res.error || "Erreur inconnue.");
        }
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    if (result) {
        const isOk = Math.abs(result.ecart) < 500; // less than 500L is OK
        return (
            <div className="text-center space-y-6 py-4">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${isOk ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {isOk ? "✓" : "⚠"}
                </div>
                <div>
                    <p className="text-white font-bold text-lg">Jaugeage Enregistré</p>
                    <p className="text-slate-400 text-sm mt-1">Comparaison Physique / Théorique</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Stock Théorique</p>
                        <p className="text-xl font-bold text-white">{result.stockTheorique.toLocaleString()} L</p>
                    </div>
                    <div className={`rounded-xl p-4 ${isOk ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Écart</p>
                        <p className={`text-xl font-bold ${isOk ? "text-green-400" : "text-red-400"}`}>
                            {result.ecart > 0 ? "+" : ""}{result.ecart.toLocaleString()} L
                        </p>
                    </div>
                </div>
                <button onClick={onSuccess} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 text-sm font-bold transition-all">
                    Fermer
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

            <div className="space-y-1.5">
                <label className={labelClass}>Équipement à Jauger</label>
                <select name="equipementId" required className={inputClass}>
                    <option value="">Sélectionner...</option>
                    {equipements.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.nom} ({eq.typeEquipement})</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Date du Jaugeage</label>
                <input name="dateJaugeage" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className={labelClass}>DIP (Quantité en Litres)</label>
                        <div className="relative">
                            <input name="volumeMesure" type="number" required className={`${inputClass} font-mono text-lg border-blue-600/30 focus:border-blue-500 pl-4`} placeholder="0" />
                            <span className="absolute right-3 top-3 text-[10px] font-bold text-blue-600">LITRES</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Temp. (°C)</label>
                        <div className="relative">
                            <input name="temperature" type="number" step="0.1" required className={`${inputClass} font-mono pl-4`} defaultValue="25.0" />
                            <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-600">°C</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-800/40 rounded-lg p-3 border border-slate-800">
                ℹ Le stock théorique sera calculé automatiquement et l'écart sera déterminé.
            </p>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg py-2 text-sm font-bold transition-all">
                    {loading ? "Calcul en cours..." : "Effectuer le Jaugeage"}
                </button>
            </div>
        </form>
    );
}
