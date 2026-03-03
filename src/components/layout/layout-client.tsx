"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
