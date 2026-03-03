"use client";

import React from "react";
import { X, User, Mail, Lock, Shield, Loader2 } from "lucide-react";
import { createUser } from "@/app/users/actions";

interface UserFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserForm({ onClose, onSuccess }: UserFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    async function action(formData: FormData) {
        setLoading(true);
        setError("");

        const result = await createUser(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            onSuccess();
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white">Nouvel Utilisateur</h2>
                    <p className="text-slate-400 text-sm">Créez un compte pour un collaborateur.</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <form action={action} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                name="nom"
                                type="text"
                                required
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600/50 transition-all text-sm"
                                placeholder="Nom"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Prénom</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                name="prenom"
                                type="text"
                                required
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600/50 transition-all text-sm"
                                placeholder="Prénom"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Adresse Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600/50 transition-all text-sm"
                            placeholder="exemple@mrsholdings.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Profil Accès</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            <Shield size={18} />
                        </div>
                        <select
                            name="profil"
                            required
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600/50 transition-all text-sm appearance-none"
                        >
                            <option value="AVITAILLEUR">Avitailleur</option>
                            <option value="SUPERVISEUR">Superviseur</option>
                            <option value="DIRECTEUR">Directeur</option>
                            <option value="ADMINISTRATEUR">Administrateur</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mot de passe provisoire</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600/50 transition-all text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? "Création..." : "Enregistrer"}
                    </button>
                </div>
            </form>
        </div>
    );
}
