"use client";

import React, { useState } from "react";
import {
    Wrench,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Plus,
    History,
    Truck,
    Fuel,
    Clock,
    User,
    FileText,
    TrendingUp
} from "lucide-react";
import { format, differenceInDays, isAfter, isBefore, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { recordMaintenance } from "../maintenance-actions";

interface Equipement {
    id: number;
    nom: string;
    typeEquipement: string;
    dateDerniereMaintenance: Date | null;
    dateProchaineMaintenance: Date | null;
}

interface Props {
    equipements: Equipement[];
}

export function MaintenanceClient({ equipements }: Props) {
    const [selectedEquipement, setSelectedEquipement] = useState<Equipement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [maintDate, setMaintDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [maintType, setMaintType] = useState("REVISION");
    const [description, setDescription] = useState("");
    const [intervenant, setIntervenant] = useState("");
    const [cout, setCout] = useState("");
    const [intervalle, setIntervalle] = useState("6"); // mois par défaut

    const handleRecordMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEquipement) return;

        setIsSaving(true);
        const dateObj = new Date(maintDate);
        const nextDate = addMonths(dateObj, parseInt(intervalle));

        try {
            const result = await recordMaintenance({
                equipementId: selectedEquipement.id,
                date: dateObj,
                type: maintType,
                description,
                intervenant,
                cout: cout ? parseFloat(cout) : undefined,
                prochaineDate: nextDate
            });

            if (result.success) {
                setIsModalOpen(false);
                setSelectedEquipement(null);
                // Reset form
                setDescription("");
                setIntervenant("");
                setCout("");
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatus = (eq: Equipement) => {
        if (!eq.dateProchaineMaintenance) return { label: "Non planifiée", color: "text-slate-500", bg: "bg-slate-500/10", icon: Clock };

        const days = differenceInDays(new Date(eq.dateProchaineMaintenance), new Date());

        if (days < 0) return { label: "En retard", color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle };
        if (days <= 15) return { label: "Imminent", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock };
        return { label: "À jour", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 italic tracking-tight">
                        <Wrench className="text-blue-500" /> Maintenance Préventive
                    </h1>
                    <p className="text-slate-400 text-sm">Suivi des révisions camions et nettoyage des cuves.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {equipements.map(eq => {
                    const status = getStatus(eq);
                    return (
                        <div key={eq.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                        {eq.typeEquipement === "CAMION" ? <Truck size={20} /> : <Fuel size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{eq.nom}</h3>
                                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">{eq.typeEquipement}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full ${status.bg} border border-${status.color.split('-')[1]}-500/20 flex items-center gap-1.5`}>
                                    <status.icon size={12} className={status.color} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pb-4 border-b border-slate-800/50 mb-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Dernière intervention</span>
                                    <span className="text-slate-300 font-bold">
                                        {eq.dateDerniereMaintenance ? format(new Date(eq.dateDerniereMaintenance), "dd MMM yyyy", { locale: fr }) : "Aucune"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Prochaine échéance</span>
                                    <span className={status.color + " font-black uppercase tracking-tighter"}>
                                        {eq.dateProchaineMaintenance ? format(new Date(eq.dateProchaineMaintenance), "dd MMM yyyy", { locale: fr }) : "À planifier"}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedEquipement(eq);
                                    setIsModalOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-black transition-all border border-blue-600/20"
                            >
                                <Plus size={14} /> Enregistrer Intervention
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal Intervention */}
            {isModalOpen && selectedEquipement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Wrench size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white italic">Rapport d'Intervention</h2>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Équipement : {selectedEquipement.nom}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleRecordMaintenance} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Date Intervention</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="date"
                                            required
                                            value={maintDate}
                                            onChange={(e) => setMaintDate(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Type d'acte</label>
                                    <select
                                        value={maintType}
                                        onChange={(e) => setMaintType(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="REVISION">Révision Périodique</option>
                                        <option value="NETTOYAGE">Nettoyage / Éprouve</option>
                                        <option value="REPARATION">Réparation Curative</option>
                                        <option value="VIDANGE">Vidange & Filtres</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Intervenant / Garage</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            value={intervenant}
                                            onChange={(e) => setIntervenant(e.target.value)}
                                            placeholder="Ex: Atelier Interne"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Coût (Gnf/CFA)</label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="number"
                                            value={cout}
                                            onChange={(e) => setCout(e.target.value)}
                                            placeholder="Montant total"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Intervalle avant prochaine (Mois)</label>
                                <select
                                    value={intervalle}
                                    onChange={(e) => setIntervalle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="1">1 mois</option>
                                    <option value="3">3 mois (Trimestriel)</option>
                                    <option value="6">6 mois (Semestriel)</option>
                                    <option value="12">12 mois (Annuel)</option>
                                    <option value="24">24 mois</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Détails de l'intervention</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-slate-500" size={16} />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Synthèse des travaux effectués..."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                            >
                                {isSaving ? "Enregistrement..." : "Valider l'Intervention"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
