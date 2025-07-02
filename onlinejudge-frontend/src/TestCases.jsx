import { useParams } from "react-router-dom";
import API from "./api";
import { useEffect, useState } from "react";

function TestCases({ problem_title }) {
    const { id } = useParams();
    const [testCases, setTestCases] = useState();

    useEffect(() => {
        API.get(`/api/problems/${id}/testcases`)
            .then(res => {
                setTestCases(res.data)
                // console.log("Successfully")
            })
            .catch(err => { console.log(err) })
    }, [id])

    if (!testCases) return <p>Loading...</p>

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Cases</h1>

            {testCases.length > 0 && (
                <p className="text-gray-600 mb-4">
                    <span className="font-medium">Problem:</span> {testCases[0].problem}
                </p>
            )}

            <ul className="space-y-4">
                {testCases.map((tc) => (
                    <li key={tc.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-700 mb-1 font-semibold">Input:</p>
                        <pre className="bg-white p-3 border rounded text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                            {tc.input}
                        </pre>

                        <p className="text-sm text-gray-700 mt-4 mb-1 font-semibold">Output:</p>
                        <pre className="bg-white p-3 border rounded text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                            {tc.output}
                        </pre>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TestCases;