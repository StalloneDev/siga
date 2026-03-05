import React from "react";
import Link from "next/link";
import {
    Globe,
    MapPin,
    Plane,
    Truck,
    ArrowRight
} from "lucide-react";

const sections = [
    {
        name: "Compagnies Aériennes",
        href: "/referentiel/compagnies",
        icon: Globe,
        count: "Liste officielle",
        desc: "Gestion des transporteurs, codes IATA/ICAO et statuts d'activité."
    },
    {
        name: "Aéroports",
        href: "/referentiel/aeroports",
        icon: MapPin,
        count: "Base mondiale",
        desc: "Référentiel des points d'origine et de destination des vols."
    },
    {
        name: "Équipements",
        href: "/referentiel/equipements",
        icon: Truck,
        count: "Parc stockage",
        desc: "Configuration des BACs et des Camions Refuellers (Capacités)."
    },
];

export default function ReferentielPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Référentiel (Master Data)</h2>
                <p className="text-slate-400 text-sm mt-1">Gérez les données fondamentales du système SIGA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        href={section.href}
                        className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/50 hover:bg-slate-900/60 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <section.icon size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                    {section.count}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            {section.name}
                            <ArrowRight size={16} className="text-slate-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {section.desc}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
