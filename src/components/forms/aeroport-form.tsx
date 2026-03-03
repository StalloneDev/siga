"use client";

import React from "react";
import { createAeroport } from "@/app/referentiel/aeroports/actions";

interface AeroportFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AeroportForm({ onSuccess, onCancel }: AeroportFormProps) {
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            nom: formData.get("nom") as string,
            ville: formData.get("ville") as string,
            pays: formData.get("pays") as string,
            codeIata: formData.get("codeIata") as string,
            codeIcao: formData.get("codeIcao") as string,
        };

        const result = await createAeroport(data);
        if (result.success) {
            onSuccess();
        } else {
            alert(result.error);
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom Aéroport</label>
                <input name="nom" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50" placeholder="Ex: Aéroport de Paris-Charles-de-Gaulle" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ville</label>
                    <input name="ville" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50" placeholder="Paris" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pays</label>
                    <input name="pays" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50" placeholder="France" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IATA (3)</label>
                    <input name="codeIata" required maxLength={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 font-mono uppercase" placeholder="CDG" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ICAO (4)</label>
                    <input name="codeIcao" required maxLength={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 font-mono uppercase" placeholder="LFPG" />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg py-2 text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                    {loading ? "Création..." : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}
