import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to PrepForge</h1>
                <p className="text-gray-400 mb-6">{user?.email}</p>
                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}