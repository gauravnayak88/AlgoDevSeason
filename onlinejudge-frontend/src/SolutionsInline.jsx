import { useState, useEffect } from "react";
import API from "./api";

function SolutionsInline({ problemId, filterMine, profile, onSelect }) {
    const [solutions, setSolutions] = useState(null);

    useEffect(() => {
        API.get(`/api/problems/${problemId}/solutions`)
            .then(res => setSolutions(res.data))
            .catch(err => console.log(err));
    }, [problemId]);

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    if (!solutions) return <p>Loading...</p>;

    const filtered = solutions.filter(sol => !filterMine || sol.written_by === profile?.username);

    return (
        <div className="space-y-4">
            {filtered.map((sol) => {
                const formattedDate = new Date(sol.submitted_at).toLocaleString("en-IN", options);
                return (
                    <div
                        key={sol.id}
                        onClick={() => onSelect(sol)}
                        className="cursor-pointer bg-white p-4 rounded-lg shadow hover:shadow-md transition"
                    >
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

                            <button
                                className="mt-3 md:mt-0 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                View
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Submitted By:</span> {sol.written_by}</p>
                            <p><span className="font-medium">Submitted At:</span> {formattedDate}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SolutionsInline;
