"use client";

import React from "react";
import { createReception } from "@/app/logistique/reception/actions";

interface Bac {
    id: number;
    nom: string;
    capaciteMaximale: number;
}

interface ReceptionFormProps {
    bacs: Bac[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function ReceptionForm({ bacs, onSuccess, onCancel }: ReceptionFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createReception({
            fournisseur: formData.get("fournisseur") as string,
            depotChargement: formData.get("depotChargement") as string,
            referenceBonLivraison: formData.get("referenceBonLivraison") as string,
            quantiteRecue: parseInt(formData.get("quantiteRecue") as string),
            densite: parseFloat(formData.get("densite") as string),
            temperature: parseFloat(formData.get("temperature") as string),
            equipementDestinationId: parseInt(formData.get("equipementDestinationId") as string),
            dateReception: formData.get("dateReception") as string,
        });

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "Une erreur est survenue.");
        }
        setLoading(false);
    }

    const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className={labelClass}>Fournisseur</label>
                    <input name="fournisseur" required className={inputClass} placeholder="Ex: SkyFuel International" />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Dépôt de chargement</label>
                    <input name="depotChargement" className={inputClass} placeholder="Ex: Dépôt Central" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>N° Bon de Livraison</label>
                <input name="referenceBonLivraison" required className={`${inputClass} font-mono uppercase`} placeholder="BL-2025-00001" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>BAC Destinataire</label>
                <select name="equipementDestinationId" required className={inputClass}>
                    <option value="">Sélectionner un BAC...</option>
                    {bacs.map(b => (
                        <option key={b.id} value={b.id}>{b.nom} (cap. {b.capaciteMaximale.toLocaleString()} L)</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                    <label className={labelClass}>Quantité (L)</label>
                    <input name="quantiteRecue" type="number" required min="1" className={`${inputClass} font-mono`} placeholder="50000" />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Densité</label>
                    <input name="densite" type="number" step="0.0001" required className={`${inputClass} font-mono`} placeholder="0.800" defaultValue="0.800" />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Temp. (°C)</label>
                    <input name="temperature" type="number" step="0.1" required className={`${inputClass} font-mono`} placeholder="25.0" defaultValue="25.0" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Date & Heure de Réception</label>
                <input
                    name="dateReception"
                    type="datetime-local"
                    required
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className={inputClass}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg py-2 text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                    {loading ? "Enregistrement..." : "Valider la Réception"}
                </button>
            </div>
        </form>
    );
}
