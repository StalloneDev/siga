"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    PlaneTakeoff,
    Fuel,
    BarChart3,
    Database,
    Settings,
    Menu,
    X,
    Plane,
    Truck,
    FileText,
    Activity,
    Users,
    LogOut
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Permission matrix
const PERMISSIONS = {
    AVITAILLEUR: ["Tableau de Bord", "Avitaillement", "Rapport de Vente", "Jaugeage", "Mon Profil"],
    SUPERVISEUR: ["Tableau de Bord", "Programme de Vol", "Comparaisons", "Réceptions", "Transferts", "Mouvements", "Jaugeage", "Analyse & Performance", "Rapport de Vente", "Mon Profil", "Maintenance"],
    DIRECTEUR: ["*"],
    ADMINISTRATEUR: ["*"],
};

const menuItems = [
    { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
    {
        name: "Exploitation Vols",
        href: "/vols",
        icon: PlaneTakeoff,
        sub: [
            { name: "Programme de Vol", href: "/vols/programme" },
            { name: "Avitaillement", href: "/vols/avitaillement" },
            { name: "Rapport de Vente", href: "/vols/rapport-vente" },
            { name: "Comparaisons", href: "/vols/comparaison" },
        ]
    },
    {
        name: "Logistique Carburant",
        href: "/logistique",
        icon: Fuel,
        sub: [
            { name: "Réceptions", href: "/logistique/reception" },
            { name: "Transferts", href: "/logistique/transfert" },
            { name: "Mouvements", href: "/logistique/mouvements" },
            { name: "Jaugeage", href: "/logistique/jaugeage" },
        ]
    },
    { name: "Analyse & Performance", href: "/analyse", icon: BarChart3 },
    {
        name: "Référentiel",
        href: "/referentiel",
        icon: Database,
        sub: [
            { name: "Compagnies", href: "/referentiel/compagnies" },
            { name: "Aéroports", href: "/referentiel/aeroports" },
            { name: "Avions", href: "/referentiel/avions" },
            { name: "Équipements", href: "/referentiel/equipements" },
            { name: "Maintenance", href: "/referentiel/equipements/maintenance" },
        ]
    },
    { name: "Utilisateurs", href: "/users", icon: Users },
    { name: "Paramètres", href: "/settings", icon: Settings },
];

function SidebarMenuItem({ item, pathname }: { item: any, pathname: string }) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const hasSub = item.sub && item.sub.length > 0;
    const [expanded, setExpanded] = React.useState(isActive);

    return (
        <div key={item.name}>
            <div className="flex items-center">
                <Link
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1",
                        isActive
                            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    )}
                >
                    <item.icon size={20} className={isActive ? "text-blue-400" : "text-slate-500"} />
                    {item.name}
                </Link>
                {hasSub && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            {hasSub && expanded && (
                <div className="ml-8 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                    {item.sub!.map((sub: any) => (
                        <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                                "block px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                pathname === sub.href
                                    ? "text-blue-400 bg-blue-600/10"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { data: session }: any = useSession();
    const [isOpen, setIsOpen] = React.useState(true);

    const userProfil = session?.user?.profil || "AVITAILLEUR";
    const allowedMenus = PERMISSIONS[userProfil as keyof typeof PERMISSIONS] || [];

    const isAllowed = (name: string) => {
        if (allowedMenus.includes("*")) return true;
        return allowedMenus.includes(name);
    };

    // Filter menu items and their submenus
    const filteredMenuItems = menuItems
        .filter(item => {
            // If item has sub, check if any sub is allowed OR if item itself is allowed
            const allowedSubs = item.sub?.filter(s => isAllowed(s.name)) || [];
            return isAllowed(item.name) || allowedSubs.length > 0;
        })
        .map(item => ({
            ...item,
            sub: item.sub?.filter(s => isAllowed(s.name))
        }));

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen overflow-hidden",
                !isOpen && "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">SIGA</h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Aero Fuel Ops</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                        {filteredMenuItems.map((item) => (
                            <SidebarMenuItem key={item.name} item={item} pathname={pathname} />
                        ))}
                    </nav>

                    {/* Bottom Info */}
                    <div className="p-4 mt-auto border-t border-slate-900/50 bg-slate-950/50">
                        <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                            <Link href="/profile" className="flex items-center gap-3 mb-3 group">
                                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {session?.user?.name?.[0] || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{session?.user?.name || "Invité"}</p>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider truncate">{userProfil}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                            >
                                <LogOut size={14} />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
