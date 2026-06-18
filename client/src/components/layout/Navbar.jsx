import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

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
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-brown-100 dark:border-gray-800 shadow-sm smooth-transition">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 group animate-fadeIn"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold gradient-text">Prep<span className="text-gray-900 dark:text-white">Forge</span></p>
                    </div>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`px-3 py-2 rounded-lg text-sm font-medium smooth-transition flex items-center gap-1.5 ${
                                    active
                                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-brown-50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                <span>{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop right */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {user && (
                        <span className="text-xs text-brown-600 dark:text-gray-500 font-medium">
                            {user.email?.split("@")[0]}
                        </span>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 smooth-transition font-medium"
                    >
                        Log out
                    </button>
                </div>

                {/* Mobile right (theme toggle + hamburger) */}
                <div className="md:hidden flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-brown-100 dark:hover:bg-gray-800 smooth-transition"
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
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-brown-100 dark:border-gray-800 px-4 py-3 space-y-1 animate-slideInUp">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium smooth-transition ${
                                    active
                                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-brown-50 dark:hover:bg-gray-800"
                                }`}
                            >
                                <span>{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                    <div className="pt-2 border-t border-brown-100 dark:border-gray-800 mt-2">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl smooth-transition"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
