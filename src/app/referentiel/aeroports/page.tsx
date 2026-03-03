import React from "react";
import { getAeroports } from "./actions";
import { AeroportList } from "./aeroport-list";

export default async function AeroportsPage() {
    const aeroports = await getAeroports();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Aéroports</h2>
                    <p className="text-slate-400 text-sm mt-1">Gérez le référentiel des points de départ et d'arrivée.</p>
                </div>
            </div>
            <AeroportList initialData={aeroports} />
        </div>
    );
}
