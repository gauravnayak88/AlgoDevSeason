import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "./api";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function Compiler() {
    const { id } = useParams();  // optional
    const [isProcessing, setIsProcessing] = useState(false);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [aiReview, setAiReview] = useState("");

    const boilerplate = {
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
        python: `# Your code here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`
    };

    // Load boilerplate on first render
    useEffect(() => {
        const savedLang = localStorage.getItem("dashboard-lang") || "cpp";
        const savedCode = localStorage.getItem(`dashboard-code-${savedLang}`);
        setLanguage(savedLang);
        setCode(savedCode || boilerplate[savedLang]);
    }, []);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        localStorage.setItem(`dashboard-code-${language}`, code); // Save old
        const newCode = localStorage.getItem(`dashboard-code-${newLang}`) || boilerplate[newLang];
        setLanguage(newLang);
        setCode(newCode);
        localStorage.setItem("dashboard-lang", newLang);
    };

    const handleRun = () => {
        setIsProcessing(true);
        API.post("/api/run", {
            code: code,
            language: language,
            input_data: input
        })
            .then((res) => {
                setOutput(res.data.output || "No output");
            })
            .catch(err => {
                console.error(err);
                setOutput("Error executing code.");
            })
            .finally(() => setIsProcessing(false));
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Online Compiler</h2>

            {/* Language Selector */}
            <label className="block text-sm font-medium text-gray-600">Select Language</label>
            <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full border rounded px-3 py-2 mb-4 focus:ring focus:ring-blue-200"
            >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
            </select>

            {/* Code Editor */}
            <CodeMirror
                value={code}
                height="200px"
                extensions={[
                    language === "cpp" || language === "c" ? cpp() :
                    language === "java" ? java() :
                    language === "python" ? python() : []
                ]}
                onChange={(value) => {
                    setCode(value);
                    localStorage.setItem(`dashboard-code-${language}`, value);
                }}
                theme="light"
                className="border rounded-md mb-4"
            />

            {/* Input Box */}
            <label className="block text-sm font-medium text-gray-600">Custom Input (Optional)</label>
            <textarea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border rounded px-3 py-2 font-mono text-sm mb-4 focus:ring focus:ring-blue-200"
            />

            {/* Buttons */}
            <button
                onClick={handleRun}
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
                {isProcessing ? "Running..." : "Run Code"}
            </button>

            {/* Output */}
            {output && (
                <div className="mt-6 bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap break-words">
                    <h4 className="font-bold mb-2">Output:</h4>
                    {output}
                </div>
            )}
        </div>
    );
}

export default Compiler;
