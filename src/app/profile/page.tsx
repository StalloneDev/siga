"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Key, Shield, LogOut, Save, AlertCircle } from "lucide-react";
import { updateUserPassword } from "./actions";
import { signOut } from "next-auth/react";

interface UserSession {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    profil?: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const user = session?.user as UserSession | undefined;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères" });
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateUserPassword(
                Number(user?.id),
                currentPassword,
                newPassword
            );

            if (result.success) {
                setMessage({ type: "success", text: "Mot de passe mis à jour avec succès !" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: "error", text: result.error || "Une erreur est survenue" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Erreur de connexion au serveur" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-3 italic tracking-tight">
                    <User className="text-blue-500" /> Mon Profil
                </h1>
                <p className="text-slate-400 text-sm">Gérez vos informations personnelles et votre sécurité.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <span className="text-3xl font-black text-white uppercase">
                                {user?.name?.[0] || "U"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{user?.name}</h2>
                            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                <Shield size={10} /> {user?.role}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-4">
                        <div className="text-xs">
                            <p className="text-slate-500 font-bold uppercase mb-1">Identifiant</p>
                            <p className="text-white font-medium">{user?.email || "ID-" + user?.id}</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold transition-all"
                        >
                            <LogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </div>

                {/* Password Change Form */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
                        <Key className="text-amber-500" size={20} />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Changement de Mot de Passe</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === "success"
                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}>
                                <AlertCircle size={18} /> {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ancien mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                                        placeholder="Min. 6 caractères"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirmer nouveau</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                                        placeholder="À l'identique"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                            >
                                {isSaving ? "Mise à jour..." : <><Save size={18} /> Enregistrer le nouveau mot de passe</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
