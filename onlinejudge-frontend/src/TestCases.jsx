import { useParams } from "react-router-dom";
import API from "./api";
import { useEffect, useState } from "react";

function TestCases() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loadedTestCases, setLoadedTestCases] = useState([]);

    useEffect(() => {
        API.get(`/api/problems/${id}/`)
            .then(res => setProblem(res.data))
            .catch(err => console.error(err));
    }, [id]);

    useEffect(() => {
        if (!problem || !problem.non_sample_test_cases) return;

        const loadTestCases = async () => {
            const loaded = await Promise.all(
                problem.non_sample_test_cases.map(async (tc) => {
                    const inputText = await fetch(tc.input_file).then(res => res.text());
                    const outputText = await fetch(tc.output_file).then(res => res.text());
                    return {
                        id: tc.id,
                        inputText,
                        outputText
                    };
                })
            );
            setLoadedTestCases(loaded);
        };

        loadTestCases();
    }, [problem]);

    if (!problem) return <p>Loading...</p>;

    if (loadedTestCases.length === 0) return <p>No hidden test cases</p>

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Hidden Test Cases</h1>

            <ul className="space-y-6">
                {loadedTestCases.map((tc, idx) => (
                    <li key={tc.id} className="bg-gray-50 p-4 rounded-md shadow-inner">
                        <h2 className="text-lg font-semibold mb-2">Test Case {idx + 1}</h2>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Input:</p>
                            <pre className="bg-white p-3 border rounded text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                {tc.inputText}
                            </pre>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Output:</p>
                            <pre className="bg-white p-3 border rounded text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                {tc.outputText}
                            </pre>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TestCases;
