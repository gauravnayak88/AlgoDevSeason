import { useState } from "react";
import API from "./api";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

function SolutionDetailInline({ solution }) {
    const [aiReview, setAiReview] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const formattedDate = new Date(solution.submitted_at).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const getAiReview = () => {
        setIsProcessing(true)
        API.post(`/api/ai-review/`, { 'code': solution.code, 'language': solution.language })
            .then(res => {
                setAiReview(res.data.review)
            })
            .catch(err => { console.log(err) })
            .finally(() => { setIsProcessing(false) })
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-4 space-y-4 text-sm text-gray-700">
            <div className="space-y-1">
                <p>
                    <span className="font-medium">Language:</span> {solution.language === 'cpp' ? 'C++' : solution.language}
                </p>
                <p>
                    <span className="font-medium">Verdict:</span>{" "}
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${solution.verdict === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : solution.verdict === "Wrong Answer"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {solution.verdict}
                    </span>
                </p>


                <p>
                    <span className="font-medium">Submitted By:</span> {solution.written_by}
                </p>
                <p>
                    <span className="font-medium">Submitted At:</span> {formattedDate}
                </p>
            </div>

            <div>
                <p className="font-medium mb-1">Code:</p>
                <div className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-4 rounded-md shadow-inner overflow-auto max-h-96">
                    {solution.code}
                </div>
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

                <button onClick={getAiReview} className="mt-3 md:mt-0 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    AI Review
                </button>
                {aiReview &&
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-md shadow-inner mb-4 overflow-auto">
                        <div className="max-h-120 overflow-y-auto">
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
                                            <code className="inline-block align-middle bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm whitespace-nowrap">
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="bg-gray-900 text-white  text-sm">
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {aiReview}
                            </ReactMarkdown>
                        </div>
                    </div>
                }


            </div>
        </div>
    );
}

export default SolutionDetailInline;
