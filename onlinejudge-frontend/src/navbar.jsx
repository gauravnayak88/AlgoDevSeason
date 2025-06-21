import { Link } from "react-router-dom";

function Navbar() {
    return (
        <div>
            <button>Home</button>
            <button>Explore</button>
            <Link to={`/problems`}><button>Problems</button></Link>
            <button>Contest</button>
            <button>Discuss</button>
            <button>Profile</button>
            <button>Logout</button>
        </div>
    )
}

export default Navbar;