import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { User } from 'lucide-react';

function Navbar({ profile, isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false);
        alert("Logged out");
        navigate("/login");
        setIsOpen(false); // close menu on logout
    };

    const handleLinkClick = () => {
        setIsOpen(false); // close menu after clicking link
    };

    return (
        <nav className="bg-gray-900 text-white border-b border-gray-700 shadow-md">
            <div className="flex justify-between items-center p-4">
                {/* Logo / Brand */}
                <Link to="/" className="text-3xl font-extrabold text-white tracking-wide hover:text-blue-400 transition">
                    G<span className="text-blue-500">C</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex gap-4 flex-1 justify-center">
                    <Link to="/"><button className="px-3 py-2 rounded hover:bg-gray-800">Home</button></Link>
                    <Link to="/explore"><button className="px-3 py-2 rounded hover:bg-gray-800">Explore</button></Link>
                    <Link to="/problems"><button className="px-3 py-2 rounded hover:bg-gray-800">Problems</button></Link>
                    {isAuthenticated &&
                        <Link to="/leaderboard"><button className="px-3 py-2 rounded hover:bg-gray-800">Leaderboard</button></Link>
                    }
                    <Link to="/challenges"><button className="px-3 py-2 rounded hover:bg-gray-800">Challenges</button></Link>
                    <Link to="/discuss"><button className="px-3 py-2 rounded hover:bg-gray-800">Discuss</button></Link>
                </div>

                {/* Desktop Auth */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated && profile ? (
                        <>
                            <Link to="/profile"><button className="px-3 py-2 bg-blue-700 rounded hover:bg-blue-800"><User size={20} className="text-white" /></button></Link>
                            {/* <span className="text-sm">Hi, <strong>{profile.username}</strong></span> */}
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"><button className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">Login</button></Link>
                            <Link to="/register"><button className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">Register</button></Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="lg:hidden">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden px-4 pb-4 space-y-2 bg-gray-800 text-white">
                    <Link to="/" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Home</div>
                    </Link>
                    <Link to="/explore" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Explore</div>
                    </Link>
                    <Link to="/problems" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Problems</div>
                    </Link>
                    <Link to="/leaderboard" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Leaderboard</div>
                    </Link>
                    <Link to="/contests" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Contests</div>
                    </Link>
                    <Link to="/discuss" onClick={handleLinkClick}>
                        <div className="block py-2 px-2 hover:bg-gray-700 rounded">Discuss</div>
                    </Link>
                    <hr className="my-2 border-gray-600" />
                    {isAuthenticated && profile ? (
                        <>
                            <Link to="/profile" onClick={handleLinkClick}>
                                <div className="block py-2 px-2 hover:bg-gray-700 rounded">Profile</div>
                            </Link>
                            {/* <div className="text-sm px-2">Hi, <strong>{profile.username}</strong></div> */}
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left py-2 px-2 bg-red-600 hover:bg-red-700 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={handleLinkClick}>
                                <div className="block py-2 px-2 bg-green-600 hover:bg-green-700 rounded">Login</div>
                            </Link>
                            <Link to="/register" onClick={handleLinkClick}>
                                <div className="block py-2 px-2 bg-blue-600 hover:bg-blue-700 rounded">Register</div>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
