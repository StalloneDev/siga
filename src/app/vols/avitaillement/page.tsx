import React from "react";
import { getAvitaillements, getAvitaillementFormData } from "./actions";
import { AvitaillementClient } from "./avitaillement-client";

export default async function AvitaillementPage() {
    const [avitaillements, formData] = await Promise.all([
        getAvitaillements(),
        getAvitaillementFormData(),
    ]);

    // Serialize BigInt fields before passing to client
    const serialized = avitaillements.map(a => ({
        ...a,
        compteurAvant: Number(a.compteurAvant),
        compteurApres: Number(a.compteurApres),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Avitaillement</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Enregistrement des opérations de carburant avec verrouillage des compteurs totalisateurs.
                </p>
            </div>
            <AvitaillementClient 
                initialData={serialized as any} 
                vols={formData.vols} 
                camions={formData.camions} 
                typeAvions={formData.typeAvions} 
                compagnies={formData.compagnies}
            />
        </div>
    );
}
