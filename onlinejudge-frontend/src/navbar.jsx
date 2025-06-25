import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ profile, isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false)
        alert("Logged out");
        navigate("/login");
    };

    return (
        <div style={{ padding: "1rem", borderBottom: "1px solid gray" }}>
            <Link to="/"><button>Home</button></Link>
            <Link to="/explore"><button>Explore</button></Link>
            <Link to="/problems"><button>Problems</button></Link>
            <Link to="/contests"><button>Contests</button></Link>
            <Link to="/discuss"><button>Discuss</button></Link>

            {isAuthenticated && profile ? (
                <>
                    <Link to="/profile"><button>Profile</button></Link>
                    <span style={{ marginLeft: "1rem" }}>
                        Hello, <strong>{profile.username}</strong>
                    </span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login"><button>Login</button></Link>
                    <Link to="/register"><button>Register</button></Link>
                </>
            )}
        </div>
    )
}

export default Navbar;