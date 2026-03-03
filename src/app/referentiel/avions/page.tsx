import React from "react";
import { getAvions, getTypeAvions } from "./actions";
import { getCompagnies } from "../compagnies/actions";
import { AvionManager } from "./avion-manager";

export default async function AvionsPage() {
    const avions = await getAvions();
    const types = await getTypeAvions();
    const compagnies = await getCompagnies();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Gestion de la Flotte</h2>
                    <p className="text-slate-400 text-sm mt-1">Gérez les modèles d'avions et les immatriculations par compagnie.</p>
                </div>
            </div>

            <AvionManager
                initialAvions={avions}
                initialTypes={types}
                compagnies={compagnies}
            />
        </div>
    );
}
