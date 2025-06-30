import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "./api";

function SolutionDetail() {
    const { id } = useParams();
    const [solution, setSolution] = useState(null);

    useEffect(() => {
        API.get(`/api/solutions/${id}`)
            .then(res => {
                setSolution(res.data)
            })
            .catch(err => { console.log(err) })
    }, [id])

    if (!solution) return <p>Loading...</p>

    // Submission date and time formatting
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const formattedDate = new Date(solution.submitted_at).toLocaleString("en-IN", options);

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md mt-6 space-y-4">
            <p className="text-gray-700">
                <span className="font-semibold text-gray-800">Language:</span> {solution.language}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold text-gray-800">Verdict:</span>{" "}
                <span className={`font-semibold px-2 py-0.5 rounded ${solution.verdict === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : solution.verdict === "Wrong Answer"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {solution.verdict}
                </span>
            </p>

            <div>
                <p className="text-gray-700 font-semibold mb-1">Code:</p>
                <div className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded-md shadow-inner font-mono text-sm">
                    {solution.code}
                </div>
            </div>

            <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-700">Written By:</span> {solution.written_by}
            </p>
            <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-700">Submitted At:</span> {formattedDate}
            </p>
        </div>
    )
}

export default SolutionDetail;