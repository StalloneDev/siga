import React from "react";
import { getTransferts, getEquipementsByType } from "./actions";
import { TransfertList } from "./transfert-list";

export default async function TransfertPage() {
    const [transfertsRaw, bacs, camions] = await Promise.all([
        getTransferts(),
        getEquipementsByType("BAC"),
        getEquipementsByType("CAMION"),
    ]);

    // Serialize to plain objects compatible with TransfertList's Transfert interface
    const transferts = transfertsRaw.map(t => ({
        id: t.id,
        equipementSourceId: t.equipementSourceId,
        equipementDestinationId: t.equipementDestinationId,
        quantiteTransferee: t.quantiteTransferee,
        referenceTransfert: t.referenceTransfert,
        dateTransfert: t.dateTransfert,
        equipementSource: t.equipementSource,
        equipementDestination: t.equipementDestination,
    }));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Transfert Carburant</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Alimentation des camions avitailleurs depuis les cuves BAC.
                </p>
            </div>
            <TransfertList initialData={transferts as any} bacs={bacs} camions={camions} />
        </div>
    );
}
