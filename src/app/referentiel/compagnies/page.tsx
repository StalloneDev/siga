import React from "react";
import { getCompagnies } from "./actions";
import { CompagnieList } from "./compagnie-list";
import { Plus } from "lucide-react";

export default async function CompagniesPage() {
    const compagnies = await getCompagnies();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Compagnies Aériennes</h2>
                    <p className="text-slate-400 text-sm mt-1">Gérez le référentiel des transporteurs aériens.</p>
                </div>
            </div>

            <CompagnieList initialData={compagnies} />
        </div>
    );
}
