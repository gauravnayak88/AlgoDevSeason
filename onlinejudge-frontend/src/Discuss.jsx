import { useEffect, useState } from "react"
import API from "./api"
import { Link } from "react-router-dom"

// Helper for avatar fallback
const Avatar = ({ name }) => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-300 to-blue-300 flex items-center justify-center text-lg font-bold text-white shadow">
        {name ? name[0].toUpperCase() : "?"}
    </div>
);

function Discuss() {
    const [discussions, setDiscussions] = useState(null);

    useEffect(() => {
        API.get(`/api/discussions/`)
            .then(res => { setDiscussions(res.data) })
            .catch(err => { console.log(err) })
    }, []);

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    if (!discussions)
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <span className="ml-4 text-lg text-gray-600">Loading discussions...</span>
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-indigo-800 drop-shadow">💬 Discussions</h2>
                <Link to="/discuss/post">
                    <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition font-semibold">
                        + New Post
                    </button>
                </Link>
            </div>

            {discussions.length === 0 ? (
                <div className="mt-24 text-center text-gray-500 text-lg">
                    No discussions yet. Be the first to post!
                </div>
            ) : (
                <ul className="space-y-6">
                    {discussions.map((disc) => {
                        const formattedDate = new Date(disc.posted_on).toLocaleString("en-IN", options);
                        return (
                            <li
                                key={disc.id}
                                className="bg-white hover:shadow-xl shadow-md rounded-2xl border border-indigo-100 transition p-6 flex flex-col sm:flex-row gap-4"
                            >
                                {/* Avatar and author */}
                                <div className="flex flex-col items-center sm:items-start gap-2 min-w-[70px]">
                                    <Avatar name={disc.written_by} />
                                    <span className="text-xs text-gray-500">{disc.written_by}</span>
                                </div>
                                {/* Main content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-semibold text-indigo-900">{disc.title}</h3>
                                        <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                                            {formattedDate}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mt-1">
                                        {disc.content.length > 120 ? disc.content.slice(0, 120) + "..." : disc.content}
                                    </p>
                                    <div className="mt-4">
                                        <Link to={`/discuss/${disc.id}`}>
                                            <button className="px-4 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 text-sm font-semibold transition">
                                                View Discussion
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    )
}

export default Discuss
