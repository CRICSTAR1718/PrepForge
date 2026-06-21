import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart3, Brain, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Target } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getMyPlan } from "../services/planService";
import logoPng from "../assets/logo.png";


const HIGHLIGHTS = [
    { icon: Target, title: "Smart Planning", text: "AI-powered plans tailored to your goals." },
    { icon: BarChart3, title: "Track Progress", text: "Visualize your progress and stay on track." },
    { icon: Brain, title: "AI Assistance", text: "Get personalised insights and suggestions." },
    { icon: CheckCircle2, title: "Stay Consistent", text: "Build habits and achieve your dreams." },
];

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const prevHtmlClass = document.documentElement.className;
        const prevBodyClass = document.body.className;
        if (!document.documentElement.classList.contains("dark")) document.documentElement.classList.add("dark");
        if (!document.body.classList.contains("dark")) document.body.classList.add("dark");
        return () => {
            document.documentElement.className = prevHtmlClass;
            document.body.className = prevBodyClass;
        };
    }, []);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", form);
            login(res.data.user, res.data.accessToken, res.data.refreshToken);
            try {
                const plan = await getMyPlan();
                navigate(plan ? "/dashboard" : "/onboarding");
            } catch {
                navigate("/onboarding");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page min-h-screen overflow-hidden bg-[#eef2ff] dark:bg-slate-950 p-0 sm:p-3 transition-colors duration-300">
            <div className="mx-auto grid h-[92vh] max-h-[92vh] max-w-[1000px] overflow-hidden rounded-none sm:rounded-[28px] bg-white shadow-2xl dark:bg-slate-950 lg:grid-cols-[42%_58%]">
                <section className="relative hidden h-full overflow-hidden bg-[#0b1040] dark:bg-slate-950 p-6 text-white xl:p-12 lg:flex lg:flex-col">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_22%,rgba(139,92,246,0.65),transparent_30%),radial-gradient(circle_at_20%_88%,rgba(79,70,229,0.35),transparent_28%)]" />

                    <div className="relative z-10 flex items-center gap-3">
                        <img src={logoPng} alt="PrepForge" className="h-14 w-14 object-contain" />
                        <p className="text-2xl font-black text-white">Prep<span className="text-violet-300">Forge</span></p>
                    </div>
                    <div className="relative z-10 mt-12 max-w-md xl:mt-16">
                        <h1 className="text-[1.9rem] sm:text-[2.6rem] font-black leading-[1.2] text-white">
                            Plan, Execute, Evaluate, <span className="text-violet-300">Improve.</span>
                        </h1>
                    </div>

                    <div className="relative z-10 mt-6 space-y-2.5 xl:mt-8">
                        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="flex items-center gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-violet-200">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{title}</p>
                                    <p className="text-sm text-indigo-200">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center overflow-hidden bg-white px-6 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-10 sm:py-10 lg:px-16 lg:py-0">
                    <div className="w-full max-w-md transform scale-95 rounded-[32px] border border-slate-200/70 bg-white/95 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.12)] transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-900/95">
                        <div className="mb-10 text-center">
                            <img src={logoPng} alt="PrepForge" className="mx-auto mb-5 h-11 w-11 object-contain lg:hidden" />
                            <h1 className="text-4xl font-black text-slate-950 dark:text-white">Welcome back!</h1>
                            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Login to continue your learning journey</p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div>
                                <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-12 py-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950 dark:focus:ring-violet-900/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">Forgot password?</span>
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-12 py-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950 dark:focus:ring-violet-900/40"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 accent-violet-600 dark:border-slate-700" />
                                Remember me
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 py-4 text-lg font-bold text-white shadow-[0_12px_26px_rgba(109,40,217,0.25)] transition hover:from-violet-600 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Logging in..." : "Log in"}
                            </button>
                        </form>

                        <p className="text-center text-lg text-slate-600 dark:text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="font-bold text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200">
                                Sign up
                            </Link>
                        </p>

                        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="h-4 w-4 text-violet-500 dark:text-violet-300" /> Your data is safe with us. We never share your information.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}