import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

function Navbar({ profile, isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false);
        alert("Logged out");
        navigate("/login");
        setIsOpen(false);
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white border-b border-gray-700 shadow-md z-50">
            <div className="relative flex items-center justify-between p-4 max-w-7xl mx-auto">
                {/* Logo / Brand */}
                <Link to="/" className="text-3xl font-extrabold text-white tracking-wide hover:text-blue-400 transition z-20">
                    G<span className="text-blue-500">C</span>
                </Link>

                {/* Centered Desktop Navigation */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-4 z-10">
                    <Link to="/"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Home</button></Link>
                    <Link to="/explore"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Explore</button></Link>
                    <Link to="/problems"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Problems</button></Link>
                    {isAuthenticated &&
                        <Link to="/leaderboard"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Leaderboard</button></Link>
                    }
                    <Link to="/contests"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Contests</button></Link>
                    <Link to="/discuss"><button className="px-3 py-2 rounded hover:bg-gray-800 transition">Discuss</button></Link>
                </div>

                {/* Desktop Auth - right aligned */}
                <div className="hidden lg:flex items-center gap-2 z-20">
                    {isAuthenticated && profile ? (
                        <>
                            <Link to="/profile">
                                <button className="p-2 bg-blue-700 rounded hover:bg-blue-800 h-10 w-10 flex items-center justify-center">
                                    <User size={20} className="text-white" />
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-sm bg-red-600 rounded hover:bg-red-700 h-10"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="px-3 py-1.5 text-sm bg-green-600 rounded hover:bg-green-700 h-10">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="px-3 py-1.5 text-sm bg-blue-600 rounded hover:bg-blue-700 h-10">
                                    Register
                                </button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="lg:hidden z-30">
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
                    {isAuthenticated && (
                        <Link to="/leaderboard" onClick={handleLinkClick}>
                            <div className="block py-2 px-2 hover:bg-gray-700 rounded">Leaderboard</div>
                        </Link>
                    )}
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
