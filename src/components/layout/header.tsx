"use client";

import React from "react";
import { Bell, Search, User } from "lucide-react";

export function Header() {
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un vol, un bon..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-slate-200 transition-colors group">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-950 rounded-full group-hover:scale-110 transition-transform" />
                </button>

                <div className="h-8 w-[1px] bg-slate-800" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-slate-200">Terminal 1 - OUA</p>
                        <p className="text-[10px] text-green-500 font-medium leading-none">Système En Ligne</p>
                    </div>
                    <div className="w-9 h-9 border border-slate-700 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
