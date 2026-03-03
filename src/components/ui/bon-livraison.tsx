"use client";

import React from "react";
import { Fuel, Plane, Calendar, Hash, Truck, User } from "lucide-react";

interface BonLivraisonProps {
    avitaillement: {
        numeroBonLivraison: string;
        quantiteLivree: number;
        compteurAvant: bigint | number;
        compteurApres: bigint | number;
        dateOperation: Date | string;
        programmeVol: {
            numeroVol: string;
            compagnie: { nom: string };
            avion: { immatriculation: string; typeAvion: { modele: string } };
            aeroportDepart?: { codeIata: string };
            aeroportArrivee?: { codeIata: string };
        };
        camion: { nom: string };
    };
}

export const BonLivraison = React.forwardRef<HTMLDivElement, BonLivraisonProps>(({ avitaillement }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-slate-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:m-0 print:w-full">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-blue-600 tracking-tighter flex items-center gap-2">
                        <Fuel size={32} /> SIGA
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">Système Intégré de Gestion d’Avitaillement</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Aéroport International - Service Pétrolier</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">Bon de Livraison</h2>
                    <p className="text-3xl font-mono font-black text-blue-600 mt-1">N° {avitaillement.numeroBonLivraison}</p>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase border-b pb-1">Informations Vol</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Plane size={16} className="text-blue-500" />
                            <span className="text-sm font-bold">{avitaillement.programmeVol.compagnie.nom}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-24">N° de Vol</span>
                            <span className="text-sm font-mono font-bold">{avitaillement.programmeVol.numeroVol}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-24">Immatriculation</span>
                            <span className="text-sm font-bold underline decoration-blue-500/30">{avitaillement.programmeVol.avion.immatriculation}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-24">Type Appareil</span>
                            <span className="text-sm">{avitaillement.programmeVol.avion.typeAvion.modele}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase border-b pb-1">Détails Opération</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-blue-500" />
                            <span className="text-sm font-bold">
                                {new Date(avitaillement.dateOperation).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-24">Heure</span>
                            <span className="text-sm font-mono">{new Date(avitaillement.dateOperation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Truck size={16} className="text-blue-500" />
                            <span className="text-sm uppercase font-bold text-slate-700">{avitaillement.camion.nom}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10">
                <h3 className="text-xs font-black text-slate-800 uppercase mb-4 tracking-widest text-center">Relevé des Compteurs</h3>
                <div className="grid grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cpt. Avant</p>
                        <p className="text-2xl font-mono font-bold text-slate-600">{Number(avitaillement.compteurAvant).toLocaleString()} L</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="h-0.5 w-full bg-slate-200 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                <Hash size={16} className="text-blue-400" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cpt. Après</p>
                        <p className="text-2xl font-mono font-bold text-slate-600">{Number(avitaillement.compteurApres).toLocaleString()} L</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 flex flex-col items-center">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Volume Net Livré</p>
                    <p className="text-6xl font-black text-slate-900 tracking-tighter">
                        {avitaillement.quantiteLivree.toLocaleString()} <span className="text-2xl ml-[-10px] font-bold text-blue-600 uppercase">Litres</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-2">JET A-1 / AVGAS (Conforme aux spécifications AFQRJOS)</p>
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-12 mt-16">
                <div className="border-t border-slate-300 pt-4">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-12 flex items-center gap-1">
                        <User size={12} /> Visa Opérateur
                    </p>
                    <div className="h-px w-full bg-slate-100"></div>
                </div>
                <div className="border-t border-slate-300 pt-4">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-12 flex items-center gap-1">
                        <Plane size={12} /> Visa Commandant de Bord / Agent
                    </p>
                    <div className="h-px w-full bg-slate-100"></div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-12 text-center text-[8px] text-slate-400 uppercase font-medium space-y-1">
                <p>Ce document atteste de la livraison effective du produit susmentionné.</p>
                <p>Signature électronique certifiée par SIGA System v1.0.0</p>
                <div className="flex justify-center items-center gap-4 mt-4 opacity-50">
                    <span className="w-20 h-px bg-slate-300"></span>
                    <Fuel size={14} />
                    <span className="w-20 h-px bg-slate-300"></span>
                </div>
            </div>
        </div>
    );
});

BonLivraison.displayName = "BonLivraison";
