import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "./api";

function Solutions() {

    const { id } = useParams()
    const [solutions, setSolution] = useState(null);
    const [profile, setProfile] = useState(null);
    const [own, setOwn] = useState(false);

    useEffect(() => {
        API.get(`/api/profile/`)
            .then(res => { setProfile(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    useEffect(() => {
        API.get(`/api/problems/${id}/solutions`)
            .then(res => { setSolution(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    if (!solutions) return <p>Loading...</p>

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };


    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Solutions</h2>

            <div className="mb-6">
                <label htmlFor="isown" className="mr-2 text-gray-700 font-medium">Show:</label>
                <select
                    id="isown"
                    onChange={(e) => setOwn(e.target.value === "true")}
                    className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                >
                    <option value="false">All</option>
                    <option value="true">Mine</option>
                </select>
            </div>

            <ul className="space-y-4">
                {solutions
                    .filter(sol => !own || sol.written_by === profile.username)
                    .map((sol) => {
                        const formattedDate = new Date(sol.submitted_at).toLocaleString("en-IN", options);
                        return (
                            <li key={sol.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Language:</span> {sol.language === 'cpp' ? 'C++' : sol.language}
                                        </p>
                                        <p><strong>Test Cases Passed:</strong> {sol.passed_count} / {sol.total_count}</p>
                                        <p className="text-sm">
                                            <span className="font-medium">Verdict:</span>{" "}
                                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${sol.verdict === "Accepted"
                                                    ? "bg-green-100 text-green-700"
                                                    : sol.verdict === "Wrong Answer"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {sol.verdict}
                                            </span>
                                        </p>
                                    </div>

                                    <Link to={`/solutions/${sol.id}`}>
                                        <button className="mt-3 md:mt-0 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                            View
                                        </button>
                                    </Link>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium">Submitted By:</span> {sol.written_by}</p>
                                    <p><span className="font-medium">Submitted At:</span> {formattedDate}</p>
                                </div>
                            </li>
                        );
                    })}
            </ul>
        </div>
    )
}

export default Solutions