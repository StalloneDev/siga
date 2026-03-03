import React from "react";
import { getMouvements } from "./actions";
import { MouvementsClient } from "./mouvements-client";

export default async function MouvementsPage() {
    const mouvements = await getMouvements(100);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Journal des Mouvements</h2>
                <p className="text-slate-400 text-sm mt-1">Traçabilité complète de tous les flux de carburant.</p>
            </div>

            <MouvementsClient initialData={mouvements as any} />
        </div>
    );
}
