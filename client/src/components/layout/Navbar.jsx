import { useState } from "react";
import logoPng from "../../assets/logo.png";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bot, CalendarCheck, ChevronLeft, ChevronRight, ClipboardCheck, ClipboardList, Home, LogOut, Menu, Settings, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

const NAV_LINKS = [
    { to: "/dashboard", label: "Command Center", icon: Home },
    { to: "/tracker", label: "Daily Execution", icon: CalendarCheck },
    { to: "/plan", label: "Plan Generator", icon: ClipboardList },
    { to: "/mentor", label: "AI Mentor", icon: Bot },
    { to: "/result", label: "Evaluator", icon: ClipboardCheck },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const username = user?.email?.split("@")[0] || "Profile";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const sidebarContent = (isMobile = false) => (
        <>
            <div className={`flex items-center ${collapsed && !isMobile ? "justify-center" : "gap-3"}`}>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 overflow-hidden">
                    <img src={logoPng} alt="PrepForge" className="h-11 w-11 object-contain" />
                    {(!collapsed || isMobile) && <div className="whitespace-nowrap"><p className="font-black text-white">Prep<span className="gradient-text">Forge</span></p><p className="text-[11px] text-slate-500">Forge. Practice. Perform.</p></div>}
                </Link>
                {!isMobile && <button onClick={() => setCollapsed((value) => !value)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white" aria-label="Toggle sidebar">{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button>}
                {isMobile && <button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white" aria-label="Close sidebar"><X className="h-5 w-5" /></button>}
            </div>

            <div className="mt-6">
                {(!collapsed || isMobile) && <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Prep Modules</p>}
                <div className="space-y-1.5">
                    {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                        const active = location.pathname === to;
                        return <Link key={to} to={to} onClick={() => setMobileOpen(false)} title={collapsed && !isMobile ? label : undefined} className={`group flex items-center rounded-xl py-2.5 transition-all ${collapsed && !isMobile ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-gradient-to-r from-violet-700 to-indigo-700 text-white shadow-[0_10px_28px_rgba(109,40,217,0.25)]" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}><Icon className="h-5 w-5 shrink-0" />{(!collapsed || isMobile) && <span className="text-sm font-semibold">{label}</span>}</Link>;
                    })}
                </div>
            </div>


            <div className="mt-auto space-y-2 pt-5">
                {(!collapsed || isMobile) && <div className="rounded-xl border border-slate-800 bg-slate-950/55 p-3"><p className="truncate font-semibold text-white">{username}</p><p className="mt-1 text-xs text-emerald-400">Intermediate</p></div>}
                <Link to="/dashboard" title={collapsed && !isMobile ? "Settings" : undefined} className={`flex items-center rounded-xl border border-slate-800 bg-slate-950/55 p-2.5 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200 ${collapsed && !isMobile ? "justify-center" : "justify-center gap-2"}`}><Settings className="h-4 w-4" />{(!collapsed || isMobile) && <span className="text-xs font-semibold">Settings</span>}</Link>
                <div className={`flex ${collapsed && !isMobile ? "flex-col" : "items-center"} gap-2`}>
                    <ThemeToggle />
                    <button onClick={handleLogout} title={collapsed && !isMobile ? "Log out" : undefined} className={`btn flex border border-slate-800 bg-slate-950/55 p-2.5 text-slate-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 dark:border-slate-800 dark:bg-slate-950/55 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-300 ${collapsed && !isMobile ? "justify-center" : "flex-1 items-center justify-center gap-2"}`}><LogOut className="h-4 w-4" />{(!collapsed || isMobile) && <span className="text-xs">Log out</span>}</button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <aside className={`hidden h-screen shrink-0 flex-col border-r border-slate-800 app-sidebar bg-[#050914]/92 p-4 shadow-[12px_0_40px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-[width] duration-300 lg:flex ${collapsed ? "w-20" : "w-72"}`}>
                {sidebarContent()}
            </aside>
            <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-slate-700 bg-[#050914]/90 p-3 text-white shadow-xl backdrop-blur lg:hidden" aria-label="Open sidebar"><Menu className="h-5 w-5" /></button>
            {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/70" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" /><aside className="relative flex h-full w-72 max-w-[86vw] flex-col app-sidebar bg-[#050914] p-5 shadow-2xl slide-in-right">{sidebarContent(true)}</aside></div>}
        </>
    );
}






