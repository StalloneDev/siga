"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Email ou mot de passe incorrect");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la connexion");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md z-10">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl text-white shadow-2xl shadow-blue-500/40 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Activity size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SIGA</h1>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em]">Aviation Fueling System</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Connexion au portail</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm animate-shake">
                                <AlertCircle size={18} />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Adresse Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemple@mrsholdings.com"
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mot de passe</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/5 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform active:scale-[0.98] transition-all mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Vérification...</span>
                                </div>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-xs">
                        &copy; 2026 SIGA - Système Intégré de Gestion de l'Avitaillement
                    </p>
                </div>
            </div>
        </div>
    );
}
