import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
                Welcome to <span className="text-blue-600">Gauge Code</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Test your code, compete with others, and improve your problem-solving skills in real time.
            </p>

            {!isAuthenticated ? (
                <Link to="/register">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition mb-8">
                        Register
                    </button>
                </Link>
            ) : (
                <Link to="/problems">
                    <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-green-700 transition mb-8">
                        Explore Problems
                    </button>
                </Link>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mt-4">
                <div className="bg-white shadow-md rounded-xl p-6 border">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">🧠 Practice</h3>
                    <p className="text-gray-600">Solve coding problems across categories and difficulties.</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6 border">
                    <h3 className="text-xl font-semibold text-green-700 mb-2">⚔️ Compete</h3>
                    <p className="text-gray-600">Solve challenges and see how you rank among peers.</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6 border">
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">📊 Analyze</h3>
                    <p className="text-gray-600">Review submissions and track your improvement over time.</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
