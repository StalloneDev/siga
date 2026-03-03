"use client";

import React from "react";
import { createCompagnie } from "@/app/referentiel/compagnies/actions";

interface CompagnieFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CompagnieForm({ onSuccess, onCancel }: CompagnieFormProps) {
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            nom: formData.get("nom") as string,
            codeIata: formData.get("codeIata") as string,
            codeIcao: formData.get("codeIcao") as string,
            pays: formData.get("pays") as string,
        };

        const result = await createCompagnie(data);
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom Compagnie</label>
                <input
                    name="nom"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all"
                    placeholder="Ex: Air France"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Code IATA (2)</label>
                    <input
                        name="codeIata"
                        required
                        maxLength={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all font-mono uppercase"
                        placeholder="AF"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Code ICAO (3)</label>
                    <input
                        name="codeIcao"
                        required
                        maxLength={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all font-mono uppercase"
                        placeholder="AFR"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pays</label>
                <input
                    name="pays"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all"
                    placeholder="France"
                />
            </div>

            <div className="flex items-center gap-3 pt-4 font-body">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg py-2 text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                    {loading ? "Création..." : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}
