import React from "react";
import { getEquipements } from "./actions";
import { EquipementList } from "./equipement-list";

export default async function EquipementsPage() {
    const equipements = await getEquipements();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Équipements de Stockage</h2>
                    <p className="text-slate-400 text-sm mt-1">Gérez vos cuves (BAC) et camions avitailleurs.</p>
                </div>
            </div>
            <EquipementList initialData={equipements} />
        </div>
    );
}
