import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import API from "./api";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import TestCaseViewer from "./TestCaseViewer";
import SolutionsInline from "./SolutionsInline";
import SolutionDetailInline from "./SolutionDetailInline";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';

function ProblemDetail() {
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sampleContents, setSampleContents] = useState([]);
    const [problem, setProblem] = useState(null);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState("description");
    const [selectedSolution, setSelectedSolution] = useState(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [aiReview, setAiReview] = useState("");
    const [aiHints, setAiHints] = useState("");
    const [aiGeneratedCode, setAiGeneratedCode] = useState("");
    const [selectedAIOption, setSelectedAIOption] = useState("review");
    const [solvedProblems, setSolvedProblems] = useState([])
    const navigate = useNavigate();

    const boilerplate = {
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}`,
        python: `# Your code here\ndef main():\n  pass\n\nif __name__ == "__main__":\n  main()`,
        java: `public class Main {\n  public static void main(String[] args) {\n      // Your code here\n  }\n}`,
        c: `#include <stdio.h>\n\nint main() {\n  // Your code here\n  return 0;\n}`
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        API.get(`/api/profile/`)
            .then(res => { setProfile(res.data) })
            .catch(err => { console.log(err) })
    }, [isAuthenticated])

    useEffect(() => {
        API.get(`/api/problems/${id}/`)
            .then(res => { setProblem(res.data) })
            .catch(err => console.error(err))
    }, [id]);

    useEffect(() => {
        if (profile) {
            API.get('/api/problems/solved')
                .then(res => setSolvedProblems(res.data))
                .catch(err => console.log(err));
        }
    }
        , [profile])

    useEffect(() => {
        if (!problem || !problem.sample_test_cases) return;
        Promise.all(
            problem.sample_test_cases.map(async (tc) => {
                const inputText = await fetch(tc.input_file).then(res => res.text());
                const outputText = await fetch(tc.output_file).then(res => res.text());
                return {
                    id: tc.id,
                    input: inputText,
                    output: outputText
                };
            })
        ).then(setSampleContents);
    }, [problem]);

    useEffect(() => {
        if (!profile) return;

        const savedLang = localStorage.getItem(`lang-${profile.username}-${id}`) || "cpp";
        setLanguage(savedLang);

        const savedCode = localStorage.getItem(`code-${profile.username}-${id}-${savedLang}`);
        if (savedCode !== null) {
            setCode(savedCode);
        } else {
            setCode(boilerplate[savedLang]);
        }
    }, [id, profile]);


    const handleRun = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        API.post("/api/run", {
            problem: problem,
            code: code,
            language: language,
            input_data: input
        })
            .then((res) => {
                setOutput(res.data.output)
                setMessage("")
            })
            .catch(err => {
                console.error(err);
                setOutput("Error executing code.");
                setMessage("Execution failed.");
            })
            .finally(() => { setIsProcessing(false) });
    }

    const getAiReview = () => {
        if (!code) {
            setAiReview("Please provide your code")
            return
        }
        setIsProcessing(true)
        API.post(`/api/aireview/`, { 'code': code, 'language': language })
            .then(res => {
                setAiReview(res.data.review)
            })
            .catch(err => { console.log(err) })
            .finally(() => { setIsProcessing(false) })
    }

    const handleAIReview = () => {
        setIsProcessing(true)
        API.post('/api/ai-review/', { code, language })
            .then(res => {
                setAiReview(res.data.review)
                setAiGeneratedCode("")
                setAiHints("")
            })
            .catch(() => setAiReview("❌ Review failed."))
            .finally(() => { setIsProcessing(false) })
    };

    const handleAIHint = () => {
        setIsProcessing(true)
        API.post('/api/ai-hint/', {
            code,
            language,
            problem: problem.description || problem.statement || ""
        })
            .then(res => {
                setAiHints(res.data.hint)
                setAiReview("")
                setAiGeneratedCode("")
            })
            .catch(() => setAiHints("❌ Hint generation failed."))
            .finally(() => { setIsProcessing(false) })
    };

    const handleAICodeGen = () => {
        setIsProcessing(true)
        API.post('/api/ai-generate/', {
            language,
            problem: problem.description || problem.statement || ""
        })
            .then(res => {
                setAiGeneratedCode(res.data.code);
                setAiReview("")
                setAiHints("")
            })
            .catch(() => setAiGeneratedCode("❌ Code generation failed."))
            .finally(() => { setIsProcessing(false) })
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        if (profile) {
            const currentLang = language;
            localStorage.setItem(`code-${profile.username}-${id}-${currentLang}`, code);
            const newLangCode = localStorage.getItem(`code-${profile.username}-${id}-${newLang}`);
            if (newLangCode !== null) {
                setCode(newLangCode);
            } else {
                setCode(boilerplate[newLang]);
            }
            localStorage.setItem(`lang-${profile.username}-${id}`, newLang);
        }
        setLanguage(newLang);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        if (!isAuthenticated) {
            alert("You need to login to submit a solution.");
            navigate("/login");
            return;
        }
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

    if (!problem) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <span className="ml-4 text-lg text-gray-600">Loading problem...</span>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start p-6 max-w-7xl mx-auto">
            {/* Left Column - Problem Details */}
            <div className="flex-1 min-w-[300px] max-w-full lg:max-w-[48%]">
                <div className="mb-4 flex space-x-2">
                    {["description", ...(isAuthenticated ? ["all", "mine"] : [])].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSelectedSolution(null); }}
                            className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200
                                ${activeTab === tab
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {tab === "description" ? "Description"
                                : tab === "all" ? "All Solutions"
                                    : "My Submissions"}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    {activeTab === "description" && (
                        <div>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">{problem.name}</h2>
                            {solvedProblems.some(p => p.id === problem.id) && <p className="text-green-600 font-semibold">Solved ✅</p>}
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className={`inline-block px-3 py-1 text-sm rounded-full font-semibold
                                        ${problem.difficulty === "easy"
                                            ? "bg-green-100 text-green-700"
                                            : problem.difficulty === "medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                </span>
                                {problem.topics && problem.topics.map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2"
                                    >
                                        {topic.name}
                                    </span>
                                ))}
                            </div>
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

                            <div className="prose max-w-none bg-gray-50 p-4 rounded-md shadow-inner mb-4 overflow-auto markdown-body">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {problem.statement}
                                </ReactMarkdown>
                                {problem.sample_test_cases.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-4">
                                        <h4 className="text-lg font-semibold mb-2">Sample Test Cases</h4>
                                        <ul className="space-y-4 text-sm font-mono">
                                            {problem.sample_test_cases.map((tc, idx) => (
                                                <li key={tc.id}>
                                                    <strong>Example {idx + 1}:</strong><br />
                                                    <strong>Input:</strong><br />
                                                    <TestCaseViewer fileUrl={tc.input_file} />
                                                    <br />
                                                    <strong>Output:</strong><br />
                                                    <TestCaseViewer fileUrl={tc.output_file} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <h3>Constraints:</h3>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {problem.constraints}
                                </ReactMarkdown>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {isAuthenticated &&
                                    <Link to={`/problems/${problem.id}/solutions`}>
                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                            View Submissions
                                        </button>
                                    </Link>

                                }
                                {isAuthenticated && profile?.role == 'staff' &&
                                    <Link to={`/problems/${problem.id}/testcases`}>
                                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                            View Test Cases
                                        </button>
                                    </Link>
                                }
                            </div>
                        </div>
                    )}

                    {(activeTab === "all" || activeTab === "mine") && (
                        <SolutionsInline
                            problemId={problem.id}
                            filterMine={activeTab === "mine"}
                            profile={profile}
                            onSelect={(sol) => {
                                setSelectedSolution(sol);
                                setActiveTab("detail");
                            }}
                        />
                    )}

                    {activeTab === "detail" && selectedSolution && (
                        <SolutionDetailInline solution={selectedSolution} />
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
                        onChange={handleLanguageChange}
                        className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-600">Code</label>
                    <CodeMirror
                        value={code}
                        height="200px"
                        extensions={[
                            language === "cpp" ? cpp() :
                                language === "c" ? cpp() :
                                    language === "java" ? java() :
                                        language === "python" ? python() :
                                            []
                        ]}
                        onChange={(value) => {
                            setCode(value);
                            const currentLang = language;
                            localStorage.setItem(`code-${profile.username}-${id}-${language}`, value);
                        }}
                        theme="light"
                        className="border rounded-md"
                    />

                    <div className="text-sm text-gray-600 mt-1">
                        ⏱ Time Limit: <span className="font-medium">{problem.time_limit} sec</span> &nbsp;|&nbsp;
                        🧠 Memory Limit: <span className="font-medium">{problem.memory_limit} MB</span>
                    </div>

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
                            <span>Processing...</span>
                        </div>
                    )}

                    {output && (
                        <div className="bg-blue-50 p-4 rounded shadow-inner text-sm font-mono">
                            <h4 className="font-bold mb-1">Output:</h4>
                            <pre className="whitespace-pre-wrap break-words">{output}</pre>
                        </div>
                    )}

                    {message && <span className={`font-semibold px-2 py-0.5 rounded ${message === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : message === "Wrong Answer"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {message}
                    </span>
                    }

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

                    {isAuthenticated && 
                    <div className="flex items-center gap-3 mt-6">
                        <select
                            value={selectedAIOption}
                            onChange={(e) => setSelectedAIOption(e.target.value)}
                            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                        >
                            <option value="review">AI Review</option>
                            <option value="hint">AI Hint</option>
                            <option value="code">AI Code</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedAIOption === "review") handleAIReview();
                                else if (selectedAIOption === "hint") handleAIHint();
                                else if (selectedAIOption === "code") handleAICodeGen();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={isProcessing}
                        >
                            Go
                        </button>
                    </div>
                    }


                    {(aiReview || aiHints || aiGeneratedCode) && (
                        <div>
                            {selectedAIOption === "review" && aiReview && (
                                <div className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded-md shadow-inner font-mono text-sm">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ children }) => <p className="mb-4">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                                            li: ({ children }) => <li className="list-disc ml-6 mb-1">{children}</li>,
                                            code({ node, inline, className, children, ...props }) {
                                                return inline ? (
                                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                                                ) : (
                                                    <pre className="bg-gray-800 text-white p-3 rounded mb-4 overflow-auto">
                                                        <code className="text-white text-sm">{children}</code>
                                                    </pre>
                                                );
                                            }
                                        }}
                                    >
                                        {aiReview}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {selectedAIOption === "hint" && aiHints && (
                                <div className="bg-purple-50 p-3 mt-4 rounded font-mono text-sm">
                                    <h4 className="font-bold mb-2">AI Hints:</h4>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ children }) => <p className="mb-4">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                                            li: ({ children }) => <li className="list-disc ml-6 mb-1">{children}</li>,
                                            code({ node, inline, className, children, ...props }) {
                                                return inline ? (
                                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                                                ) : (
                                                    <pre className="bg-gray-800 text-white p-3 rounded mb-4 overflow-auto">
                                                        <code className="text-white text-sm">{children}</code>
                                                    </pre>
                                                );
                                            }
                                        }}
                                    >{aiHints}</ReactMarkdown>
                                </div>
                            )}

                            {selectedAIOption === "code" && aiGeneratedCode && (
                                <div className="bg-orange-50 p-3 mt-4 rounded font-mono text-sm">
                                    <h4 className="font-bold mb-2">Generated Code:</h4>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ children }) => <p className="mb-4">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                                            li: ({ children }) => <li className="list-disc ml-6 mb-1">{children}</li>,
                                            code({ node, inline, className, children, ...props }) {
                                                return inline ? (
                                                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                                                ) : (
                                                    <pre className="bg-gray-800 text-white p-3 rounded mb-4 overflow-auto">
                                                        <code className="text-white text-sm">{children}</code>
                                                    </pre>
                                                );
                                            }
                                        }}
                                    >{aiGeneratedCode}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}


                </form>
            </div>
        </div>
    );
}

export default ProblemDetail;
