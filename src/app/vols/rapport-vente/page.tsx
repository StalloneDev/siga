import { getSalesReportData } from "./actions";
import { RapportList } from "./RapportList";

export const dynamic = "force-dynamic";

export default async function RapportVentePage() {
    const { report } = await getSalesReportData();

    return (
        <div className="flex-1 p-8 overflow-auto">
            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-black text-white tracking-tight">Rapport de Vente</h1>
                    <p className="text-slate-400 mt-2 font-medium">Vue consolidée des opérations d'avitaillement.</p>
                </div>

                <RapportList initialData={report} />
            </div>
        </div>
    );
}
