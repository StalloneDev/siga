import React from "react";
import { getEquipementsMaintenance } from "../maintenance-actions";
import { MaintenanceClient } from "./maintenance-client";

export default async function MaintenancePage() {
    const equipements = await getEquipementsMaintenance();

    return (
        <div className="p-6">
            <MaintenanceClient equipements={equipements as any[]} />
        </div>
    );
}
