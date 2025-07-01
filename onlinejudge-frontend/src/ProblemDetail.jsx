import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import API from "./api";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

function ProblemDetail() {
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [problem, setProblem] = useState(null);
    const [profile, setProfile] = useState(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [language, setLanguage] = useState("python");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [aiReview, setAiReview] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);  // true if token exists
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        API.get(`/api/profile/`)
            .then(res => { setProfile(res.data) })
            .catch(err => { console.log(err) })
    }, [isAuthenticated])

    useEffect(() => {
        // setTimeout(() => {
        //     API.get(`/api/problems/${id}/`)
        //         .then(res => setProblem(res.data))
        //         .catch(err => console.error(err));
        // }, 1000)
        axios.get(`http://localhost:8000/api/problems/${id}/`)
            .then(res => setProblem(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleRun = (e) => {
        e.preventDefault()

        setIsProcessing(true);
        // if (!isAuthenticated) {
        //     alert("You need to login to run a code.");
        //     navigate("/login");
        //     return;
        // }

        API.post("/api/run", {
            code: code,
            language: language,
            input_data: input
        })
            .then((res) => {
                setOutput(res.data.output)
                setMessage("")
                // setMessage("Code executed successfully!");
            })
            .catch(err => {
                console.error(err);
                setOutput("Error executing code.");
                setMessage("Execution failed.");
            })
            .finally(() => { setIsProcessing(false) });

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsProcessing(true);

        if (!isAuthenticated) {
            alert("You need to login to submit a solution.");
            navigate("/login");
            return;
        }

        console.log("Access token:", localStorage.getItem("access"));

        API.post('/api/solutions/', {
            problem: id,
            language: language,
            code: code,
            input_data: input,
        })
            .then(res => {
                setMessage(res.data.verdict);
                setOutput(<ul>
                    {res.data.results.map((r, idx) => (
                        <li key={idx}>
                            <b>Test Case {idx + 1}:</b> {r.verdict}
                        </li>
                    ))}
                </ul>
                )
                setAiReview(<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                    <h4 className="font-bold mb-2">AI Review:</h4>
                    <p>{res.data.ai_feedback}</p>
                </div>)
                // setOutput(JSON.stringify(res.data.results, null, 2)); // Optional: show detailed feedback
            })
            .catch(err => {
                console.error(err);
                setMessage("Submission failed.");
            })
            .finally(() => { setIsProcessing(false) });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this problem?")) {
            API.delete(`api/problems/${id}/`)
                .then(() => navigate("/problems"))
                .catch((err) => console.log(err));
        }
    };

    if (!problem) return <p>Loading</p>;

    return (
        <div className="flex flex-wrap gap-8 items-start p-6">
            {/* Left Column - Problem Details */}
            <div className="flex-1 min-w-[300px] max-w-full lg:max-w-[48%]">
                <h2 className="text-3xl font-bold mb-2 text-gray-800">{problem.name}</h2>
                <p className="text-gray-700 mb-1">
                    <strong>Difficulty:</strong>{" "}
                    <span
                        className={`inline-block px-2 py-0.5 text-sm rounded-full ${problem.difficulty === "easy"
                            ? "bg-green-100 text-green-700"
                            : problem.difficulty === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {problem.difficulty}
                    </span>
                </p>
                <p className="italic text-sm text-gray-500 mb-4">
                    Contributed by {problem.written_by}
                </p>

                {isAuthenticated && profile?.role === "staff" && problem.written_by === profile.username && (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => navigate(`/problems/${id}/edit`)}
                            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                )}

                <div className="prose max-w-none bg-gray-50 p-4 rounded-md shadow-inner mb-4 overflow-auto">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            p: ({ children }) => <p className="mb-4">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                            li: ({ children }) => <li className="list-disc ml-6 mb-1">{children}</li>,
                            pre: ({ children }) => <pre className="bg-gray-800 text-white p-3 rounded mb-4 overflow-auto">{children}</pre>,
                            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                        }}
                    >
                        {problem.statement}
                    </ReactMarkdown>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <Link to={`/problems/${problem.id}/solutions`}>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            View Submissions
                        </button>
                    </Link>
                    {isAuthenticated && profile?.role === "staff" && (
                        <Link to={`/problems/${problem.id}/testcases`}>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                View Test Cases
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Right Column - Submission Form */}
            <div className="flex-1 min-w-[300px] max-w-full lg:max-w-[48%] bg-white p-6 rounded-xl shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Submit your solution</h3>

                    <label className="block text-sm font-medium text-gray-600">Select Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-600">Code</label>
                    <textarea
                        rows={10}
                        placeholder="Write your code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2 font-mono text-sm focus:ring focus:ring-blue-200"
                    />

                    <label className="block text-sm font-medium text-gray-600">Input</label>
                    <textarea
                        rows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full border rounded px-3 py-2 font-mono text-sm focus:ring focus:ring-blue-200"
                    />

                    {isProcessing && (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                                ></path>
                            </svg>
                            <span>Running your code...</span>
                        </div>
                    )}

                    {output && (
                        <div className="bg-blue-50 p-4 rounded shadow-inner text-sm font-mono">
                            <h4 className="font-bold mb-1">Output:</h4>
                            <pre className="whitespace-pre-wrap break-words">{output}</pre>
                        </div>
                    )}

                    {/* {message && <p className="text-red-600">{message}</p>} */}
                    {message && <span className={`font-semibold px-2 py-0.5 rounded ${message === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : message === "Wrong Answer"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {message}
                    </span>
                    }

                    {aiReview}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleRun}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Run
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProblemDetail;