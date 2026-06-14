import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_LINKS = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/tracker", label: "Today's Tracker", icon: "✅" },
    { to: "/plan", label: "My Plan", icon: "📅" },
    { to: "/mentor", label: "Mentor Chat", icon: "💬" },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="text-base font-bold text-indigo-600 dark:text-indigo-400 tracking-tight"
                >
                    Prep<span className="text-gray-900 dark:text-white">Forge</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${active
                                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <span>{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop right */}
                <div className="hidden md:flex items-center gap-3">
                    {user && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {user.email?.split("@")[0]}
                        </span>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition font-medium"
                    >
                        Log out
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active
                                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <span>{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
