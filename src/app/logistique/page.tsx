import React from "react";
import Link from "next/link";
import { PackageCheck, ArrowLeftRight, BookOpen, Gauge, ArrowRight } from "lucide-react";

const sections = [
    {
        name: "Réception Carburant",
        href: "/logistique/reception",
        icon: PackageCheck,
        color: "text-green-400",
        bg: "bg-green-500/10 group-hover:bg-green-600",
        desc: "Enregistrez les livraisons des fournisseurs vers les cuves BAC.",
    },
    {
        name: "Transfert BAC → Camion",
        href: "/logistique/transfert",
        icon: ArrowLeftRight,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10 group-hover:bg-cyan-600",
        desc: "Ravitaillez les camions avitailleurs depuis les cuves fixes.",
    },
    {
        name: "Journal des Mouvements",
        href: "/logistique/mouvements",
        icon: BookOpen,
        color: "text-purple-400",
        bg: "bg-purple-500/10 group-hover:bg-purple-600",
        desc: "Traçabilité complète de tous les flux de carburant.",
    },
    {
        name: "Jaugeage & Écarts",
        href: "/logistique/jaugeage",
        icon: Gauge,
        color: "text-amber-400",
        bg: "bg-amber-500/10 group-hover:bg-amber-600",
        desc: "Contrôle physique des stocks et analyse des écarts.",
    },
];

export default function LogistiquePage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Logistique Carburant</h2>
                <p className="text-slate-400 text-sm mt-1">Gestion de tous les flux : réceptions, transferts et contrôles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map(section => (
                    <Link key={section.name} href={section.href}
                        className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/50 hover:bg-slate-900/60 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.bg} group-hover:text-white transition-all`}>
                                <section.icon size={24} className={`${section.color} group-hover:text-white transition-colors`} />
                            </div>
                            <ArrowRight size={16} className="text-slate-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all mt-1" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{section.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{section.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
