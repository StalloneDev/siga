"use client";

import React from "react";
import { createEquipement } from "@/app/referentiel/equipements/actions";
import { EquipementType } from "@prisma/client";

export function EquipementForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await createEquipement({
            nom: formData.get("nom") as string,
            typeEquipement: formData.get("typeEquipement") as EquipementType,
            capaciteMaximale: parseInt(formData.get("capaciteMaximale") as string),
            stockInitial: parseInt(formData.get("stockInitial") as string),
            seuilAlerte: parseInt(formData.get("seuilAlerte") as string),
        });
        if (result.success) onSuccess();
        else alert(result.error);
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Nom de l'équipement</label>
                <input name="nom" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white" placeholder="Ex: BAC 1 ou Refueller R-28" /></div>

            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select name="typeEquipement" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white">
                    <option value="BAC">BAC (Stockage fixe)</option>
                    <option value="CAMION">CAMION (Avitailleur)</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Capacité Max (L)</label>
                    <input name="capaciteMaximale" type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white font-mono" placeholder="1500000" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Stock Initial (L)</label>
                    <input name="stockInitial" type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white font-mono" placeholder="0" /></div>
            </div>

            <div className="space-y-1.5"><label className="text-xs font-bold text-amber-500 uppercase">Seuil d'alerte (L)</label>
                <input name="seuilAlerte" type="number" required className="w-full bg-slate-950 border border-amber-900/30 rounded-lg py-2 px-3 text-sm text-amber-100 font-mono" placeholder="Ex: 5000" />
                <p className="text-[10px] text-slate-500 italic">Un email sera envoyé quand le stock descend sous ce seuil.</p>
            </div>

            <div className="flex gap-3 pt-4 font-body"><button type="button" onClick={onCancel} className="flex-1 text-slate-400 text-sm font-medium">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold">{loading ? "..." : "Enregistrer"}</button></div>
        </form>
    );
}
