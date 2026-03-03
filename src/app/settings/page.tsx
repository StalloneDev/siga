"use client";

import React, { useState, useEffect } from "react";
import { Settings, Bell, Database, Save, Fuel } from "lucide-react";
import { getSystemSettings, updateSystemSetting } from "./actions";

export default function SettingsPage() {
    const [threshold, setThreshold] = useState(20);
    const [density, setDensity] = useState(0.8000);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                const settings = await getSystemSettings();
                if (settings.stock_threshold) setThreshold(parseInt(settings.stock_threshold));
                if (settings.default_density) setDensity(parseFloat(settings.default_density));
            } catch (error) {
                console.error("Erreur de chargement des paramètres:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemSetting("stock_threshold", threshold.toString());
            await updateSystemSetting("default_density", density.toString());
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Erreur de sauvegarde:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <Settings className="text-blue-500" /> Paramètres du Système
                    </h1>
                    <p className="text-slate-400 text-sm">Configurez les seuils opérationnels et les valeurs par défaut.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-6 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                    <Save size={18} /> {isSaving ? "Sauvegarde..." : saved ? "Enregistré !" : "Enregistrer"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Alerts */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <Bell className="text-amber-500" size={20} />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Alertes de Stock</h2>
                    </div>
                    <div className="space-y-6 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Seuil de stock critique (%)</label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={threshold}
                                onChange={(e) => setThreshold(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-slate-500">5%</span>
                                <span className="text-lg font-mono font-bold text-blue-400">{threshold}%</span>
                                <span className="text-[10px] text-slate-500">50%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 italic">Les alertes système s'activeront quand un équipement passera sous ce niveau.</p>
                        </div>
                    </div>
                </div>

                {/* Logistics Defaults */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <Fuel className="text-cyan-500" size={20} />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Logistique & Produits</h2>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Densité par défaut (JET A-1)</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={density}
                                onChange={(e) => setDensity(parseFloat(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                            <p className="text-[10px] text-blue-400 font-medium">
                                Cette valeur sera pré-remplie dans les formulaires de réception et de jaugeage pour accélérer la saisie.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Database Info */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-3 rounded-xl text-green-500">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">État de la Base de Données</h3>
                            <p className="text-xs text-slate-500">Connecté à Neon PostgreSQL (Produit: SIGA_DB_Cluster)</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] uppercase font-black text-green-500 tracking-widest">Opérationnel</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
