"use client";

import React from "react";
import { createAvion } from "@/app/referentiel/avions/actions";

export function AvionForm({
    compagnies,
    types,
    onSuccess,
    onCancel
}: {
    compagnies: any[],
    types: any[],
    onSuccess: () => void,
    onCancel: () => void
}) {
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await createAvion({
            immatriculation: formData.get("immatriculation") as string,
            typeAvionId: parseInt(formData.get("typeAvionId") as string),
            compagnieId: parseInt(formData.get("compagnieId") as string),
        });
        if (result.success) onSuccess();
        else alert(result.error);
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Immatriculation</label>
                <input name="immatriculation" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white uppercase font-mono" placeholder="F-GZCP" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modèle d'appareil</label>
                <select name="typeAvionId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white">
                    <option value="">Sélectionner un modèle...</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.constructeur} {t.modele}</option>)}
                </select>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compagnie Propriétaire</label>
                <select name="compagnieId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white">
                    <option value="">Sélectionner une compagnie...</option>
                    {compagnies.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
            </div>
            <div className="flex gap-3 pt-4 font-body"><button type="button" onClick={onCancel} className="flex-1 text-slate-400 text-sm font-medium">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold">{loading ? "..." : "Enregistrer"}</button></div>
        </form>
    );
}
