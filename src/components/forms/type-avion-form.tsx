"use client";

import React from "react";
import { createTypeAvion } from "@/app/referentiel/type-avions/actions";

export function TypeAvionForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await createTypeAvion({
            constructeur: formData.get("constructeur") as string,
            modele: formData.get("modele") as string,
            codeIata: formData.get("codeIata") as string,
            codeIcao: formData.get("codeIcao") as string,
            capaciteReservoir: parseInt(formData.get("capaciteReservoir") as string),
        });
        if (result.success) onSuccess();
        else alert(result.error);
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Constructeur</label>
                    <input name="constructeur" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white" placeholder="Boeing" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Modèle</label>
                    <input name="modele" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white" placeholder="737-800" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">IATA (3)</label>
                    <input name="codeIata" required maxLength={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white uppercase" placeholder="738" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">ICAO (4)</label>
                    <input name="codeIcao" required maxLength={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white uppercase" placeholder="B738" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Capacité Réservoir (L)</label>
                <input name="capaciteReservoir" type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white font-mono" placeholder="26020" /></div>
            <div className="flex gap-3 pt-4 font-body"><button type="button" onClick={onCancel} className="flex-1 text-slate-400 text-sm">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold">{loading ? "..." : "Enregistrer"}</button></div>
        </form>
    );
}
