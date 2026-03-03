"use client";

import React from "react";
import { Users, UserPlus, Shield, CheckCircle, XCircle, MoreVertical, Ban, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import UserForm from "@/components/forms/user-form";
import { getUsers, toggleUserStatus } from "./actions";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = React.useState(initialUsers);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const refreshUsers = async () => {
        const data = await getUsers();
        setUsers(data as any);
        setIsModalOpen(false);
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const result = await toggleUserStatus(id, currentStatus);
        if (result.success) {
            refreshUsers();
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.actif).length,
        admins: users.filter(u => u.profil === 'ADMINISTRATEUR' || u.profil === 'DIRECTEUR').length
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Gestion des Utilisateurs</h1>
                    <p className="text-slate-400 text-sm">Gérez les accès et les profils de l'équipe SIGA.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                    <UserPlus size={18} />
                    Nouvel Utilisateur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center text-green-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Actifs</p>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Responsables</p>
                            <p className="text-2xl font-bold text-white">{stats.admins}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                    <h2 className="text-lg font-bold text-white">Liste des comptes</h2>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700 uppercase tracking-widest font-bold">
                        {users.length} Utilisateurs
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/20 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                                <th className="px-6 py-4">Utilisateur</th>
                                <th className="px-6 py-4">Profil</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center font-bold text-blue-500 group-hover:scale-110 transition-transform">
                                                {user.prenom[0]}{user.nom[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{user.prenom} {user.nom}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.profil === 'ADMINISTRATEUR' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            user.profil === 'DIRECTEUR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                user.profil === 'SUPERVISEUR' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                            {user.profil}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.actif ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Actif
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(user.id, user.actif)}
                                            className={`p-2 rounded-lg border transition-all ${user.actif ? 'bg-red-500/5 text-red-400 border-red-500/10 hover:bg-red-500 hover:text-white' : 'bg-green-500/5 text-green-400 border-green-500/10 hover:bg-green-500 hover:text-white'
                                                }`}
                                            title={user.actif ? "Désactiver" : "Activer"}
                                        >
                                            {user.actif ? <Ban size={16} /> : <Check size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Ajouter un collaborateur"
            >
                <UserForm
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={refreshUsers}
                />
            </Modal>
        </div>
    );
}
