import React from "react";
import { getReceptions, getBacs } from "./actions";
import { ReceptionList } from "./reception-list";

export default async function ReceptionPage() {
    const [receptionsRaw, bacs] = await Promise.all([getReceptions(), getBacs()]);

    // Serialize Decimal fields (densite, temperature) to number
    const receptions = receptionsRaw.map(r => ({
        ...r,
        densite: Number(r.densite),
        temperature: Number(r.temperature),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Réception Carburant</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Enregistrement des livraisons carburant reçues dans les cuves BAC.
                </p>
            </div>
            <ReceptionList initialData={receptions as any} bacs={bacs} />
        </div>
    );
}
