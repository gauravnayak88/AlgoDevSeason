import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token=localStorage.getItem("access")
        setIsAuthenticated(!!token)
    })

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        alert("Logged out");
        navigate("/login");
    };
    return (
        <div>
            <Link to="/"><button>Home</button></Link>
            <button>Explore</button>
            <Link to={`/problems`}><button>Problems</button></Link>
            <button>Contest</button>
            <button>Discuss</button>
            {isAuthenticated ? 
            (<>
                <button>Profile</button>
                <button onClick={logout}>Logout</button>
            </>):(
                <Link to="/login"><button>Login</button></Link>
            )}
        </div>
    )
}

export default Navbar;