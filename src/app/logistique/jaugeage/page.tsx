import React from "react";
import { getJaugeages, getEquipements } from "./actions";
import { JaugeageClient } from "./jaugeage-client";

export default async function JaugeagePage() {
    const [jaugeagesRaw, equipements] = await Promise.all([getJaugeages(), getEquipements()]);

    // Serialize Decimal fields to number for client component
    const jaugeages = jaugeagesRaw.map(j => ({
        ...j,
        valeurDipMm: Number(j.valeurDipMm),
        temperature: Number(j.temperature),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Jaugeage & Contrôle des Écarts</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Contrôle physique des stocks et analyse des écarts par rapport au stock théorique.
                </p>
            </div>
            <JaugeageClient initialData={jaugeages as any} equipements={equipements} />
        </div>
    );
}
