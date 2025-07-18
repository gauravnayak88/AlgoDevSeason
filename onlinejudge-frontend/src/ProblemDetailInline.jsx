import React, { useState, useEffect } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import API from "./api";
import TestCaseViewer from "./TestCaseViewer";

const boilerplate = {
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}`,
    python: `# Your code here\ndef main():\n  pass\n\nif __name__ == "__main__":\n  main()`,
    java: `public class Main {\n  public static void main(String[] args) {\n      // Your code here\n  }\n}`,
    c: `#include <stdio.h>\n\nint main() {\n  // Your code here\n  return 0;\n}`
};

export default function ProblemDetailInline({ profile, problem, isSolved, isEnded }) {
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!problem) return;

        if (profile) {
            const savedLang = localStorage.getItem(`lang-${profile.username}-${problem.id}`) || "cpp";
            setLanguage(savedLang);
            const savedCode = localStorage.getItem(`code-${profile.username}-${problem.id}-${savedLang}`);
            if (savedCode !== null) {
                setCode(savedCode);
            } else {
                setCode(boilerplate[savedLang]);
            }
        }
    }, [problem]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        localStorage.setItem(`code-${problem.id}-${language}`, code);
        const newLangCode = localStorage.getItem(`code-${problem.id}-${newLang}`);
        setCode(newLangCode !== null ? newLangCode : boilerplate[newLang]);
        setLanguage(newLang);
        localStorage.setItem(`lang-${problem.id}`, newLang);
    };

    const handleRun = () => {
        setIsProcessing(true);
        API.post("/api/run", {
            problem,
            code,
            language,
            input_data: input
        })
            .then(res => {
                setOutput(res.data.output);
                setMessage("");
            })
            .catch(() => {
                setOutput("❌ Error executing code.");
                setMessage("Execution failed.");
            })
            .finally(() => setIsProcessing(false));
    };

    const handleSubmit = () => {
        setIsProcessing(true);
        API.post('/api/solutions/', {
            problem: problem.id,
            language,
            code,
            input_data: input
        })
            .then(res => {
                setMessage(res.data.verdict);
                setOutput(
                    <ul>
                        {res.data.results.map((r, idx) => (
                            <li key={idx}><b>Test Case {idx + 1}:</b> {r.verdict}</li>
                        ))}
                    </ul>
                );
            })
            .catch(() => {
                setMessage("❌ Submission failed.");
            })
            .finally(() => setIsProcessing(false));
    };

    if (!problem) {
        return (
            <div className="text-center text-gray-600 py-10">
                <p>No problem selected or available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Solve: {problem.name}</h3>
            {isSolved && <p className="text-green-600 font-semibold">Solved ✅</p>}
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
            </div>
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
            <label className="block text-sm font-medium text-gray-600 mb-1">Language</label>
            <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full border px-3 py-2 mb-3 rounded focus:outline-none focus:ring focus:ring-indigo-300"
            >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
            </select>

            <label className="block text-sm font-medium text-gray-600 mb-1">Code</label>
            <CodeMirror
                value={code}
                height="200px"
                extensions={[
                    language === "cpp" ? cpp() :
                        language === "c" ? cpp() :
                            language === "java" ? java() :
                                language === "python" ? python() : []
                ]}
                onChange={(val) => {
                    setCode(val);
                    localStorage.setItem(`code-${profile.username}-${problem.id}-${language}`, val);
                }}
                theme="light"
                className="border rounded"
            />

            <label className="block text-sm font-medium text-gray-600 mt-4">Custom Input</label>
            <textarea
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border px-3 py-2 rounded font-mono text-sm mt-1"
            />

            {isProcessing && (
                <div className="flex items-center gap-2 mt-4 text-indigo-600">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
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
                <div className="bg-gray-100 mt-4 p-4 rounded shadow-inner font-mono text-sm">
                    <h4 className="font-semibold mb-2">Output:</h4>
                    <pre>{output}</pre>
                </div>
            )}

            {message && (
                <div className={`mt-3 font-semibold px-3 py-1 rounded inline-block ${message === "Accepted"
                    ? "bg-green-100 text-green-700"
                    : message === "Wrong Answer"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {message}
                </div>
            )}

            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleRun}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    disabled={isProcessing}
                >
                    Run
                </button>
                {!isEnded &&
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={isProcessing}
                    >
                        Submit
                    </button>
                }
            </div>
        </div>
    );
}
