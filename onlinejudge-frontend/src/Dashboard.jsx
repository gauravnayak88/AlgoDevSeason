import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Animated icon for the CTA button
const ArrowIcon = () => (
    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-50 via-white to-purple-100 animate-gradient-x h-full w-full" />

            {/* Hero Section */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow">
                Welcome to <span className="text-blue-600 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Gauge Code</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Test your code, compete with others, and improve your problem-solving skills in real time.
            </p>

            {/* CTA Button */}
            {!isAuthenticated ? (
                <Link to="/register">
                    <button className="group bg-blue-600 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition mb-10 flex items-center mx-auto">
                        Register
                        <ArrowIcon />
                    </button>
                </Link>
            ) : (
                <Link to="/problems">
                    <button className="group bg-green-600 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:bg-green-700 transition mb-10 flex items-center mx-auto">
                        Problem Catalog
                        <ArrowIcon />
                    </button>
                </Link>
            )}
            <Link to="/compiler">
                <button className="group bg-green-600 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:bg-green-700 transition mb-10 flex items-center mx-auto">
                    Try Our Compiler
                    <ArrowIcon />
                </button>
            </Link>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-4">
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-blue-100 hover:-translate-y-1 hover:shadow-2xl transition transform duration-200">
                    <div className="flex items-center justify-center mb-3">
                        <span className="text-3xl">🧠</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-700 mb-2">Practice</h3>
                    <p className="text-gray-600">Solve coding problems across categories and difficulties.</p>
                </div>
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-green-100 hover:-translate-y-1 hover:shadow-2xl transition transform duration-200">
                    <div className="flex items-center justify-center mb-3">
                        <span className="text-3xl">⚔️</span>
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Compete</h3>
                    <p className="text-gray-600">Solve challenges and see how you rank among peers.</p>
                </div>
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-purple-100 hover:-translate-y-1 hover:shadow-2xl transition transform duration-200">
                    <div className="flex items-center justify-center mb-3">
                        <span className="text-3xl">📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-purple-700 mb-2">Analyze</h3>
                    <p className="text-gray-600">Review submissions and track your improvement over time.</p>
                </div>
            </div>
            {/* Optional: Subtle animated background shape */}
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
        </div>
    );
}

export default Dashboard;
