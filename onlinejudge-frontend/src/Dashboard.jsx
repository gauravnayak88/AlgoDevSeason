import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access")
        setIsAuthenticated(!!token)
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
                Welcome to <span className="text-blue-600">Online Judge</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Gauge your skills and readiness using the ultimate judge
            </p>

            {!isAuthenticated && (
                <Link to="/register">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
                        Register
                    </button>
                </Link>
            )}
        </div>
    )
}

export default Dashboard;