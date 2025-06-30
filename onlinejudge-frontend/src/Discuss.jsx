import { useEffect, useState } from "react"
import API from "./api"
import { Link } from "react-router-dom"

function Discuss() {
    const [discussions, setDiscussions] = useState(null)


    useEffect(() => {
        API.get(`/api/discussions/`)
            .then(res => { setDiscussions(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    if (!discussions) return <p>Loading...</p>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Discussions</h2>
                <Link to="/discuss/post">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Post
                    </button>
                </Link>
            </div>

            <ul className="space-y-4">
                {discussions.map((disc) => {
                    const formattedDate = new Date(disc.posted_on).toLocaleString("en-IN", options);
                    return (
                        <li key={disc.id} className="bg-white shadow-md rounded-lg p-4 border">
                            <h3 className="text-xl font-semibold text-gray-800">{disc.title}</h3>
                            <p className="text-sm text-gray-600">
                                by <span className="font-medium">{disc.written_by}</span> • {formattedDate}
                            </p>
                            <p className="text-gray-700 mt-2">
                                {disc.content.length > 100 ? disc.content.slice(0, 100) + "..." : disc.content}
                            </p>
                            <div className="mt-3">
                                <Link to={`/discuss/${disc.id}`}>
                                    <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                        View
                                    </button>
                                </Link>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}

export default Discuss