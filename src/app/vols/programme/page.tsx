import React from "react";
import { getProgrammeVols, getVolFormData, getDailyFuelingKPIs } from "./actions";
import { ProgrammeVolClient } from "./programme-vol-client";

export default async function ProgrammeVolPage() {
    const [vols, formData, kpis] = await Promise.all([
        getProgrammeVols(),
        getVolFormData(),
        getDailyFuelingKPIs(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Programme des Vols</h2>
                <p className="text-slate-400 text-sm mt-1">Planification et suivi des vols avec besoins en carburant.</p>
            </div>
            <ProgrammeVolClient
                initialData={vols}
                compagnies={formData.compagnies}
                avions={formData.avions}
                aeroports={formData.aeroports}
                initialKpis={kpis}
            />
        </div>
    );
}
