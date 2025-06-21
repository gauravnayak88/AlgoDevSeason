import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token=localStorage.getItem("access")
        setIsAuthenticated(!!token)
    })

    return (
        <div>
            <h1>Welcome to Online Judge</h1>
            <p>Gauge your skills and readiness using the ultimate judge</p>
            {!isAuthenticated ? (
                <Link to={`/register`}>
                    <button>Register</button>
                </Link>)
            :
            (<></>)}
        </div>
    )
}

export default Dashboard;