import React from "react";
import Link from "next/link";
import { CalendarDays, PlaneTakeoff, ArrowRight } from "lucide-react";

const sections = [
    {
        name: "Programme des Vols",
        href: "/vols/programme",
        icon: CalendarDays,
        color: "text-blue-400",
        bg: "bg-blue-500/10 group-hover:bg-blue-600",
        desc: "Consultez et gérez le planning journalier des vols avec les besoins en carburant.",
    },
];

export default function VolsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Exploitation Vols</h2>
                <p className="text-slate-400 text-sm mt-1">Gestion du programme de vol et des avitaillements.</p>
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
