import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "./api";

function TestCaseUpload({ isSample }) {
    const [success, setSuccess] = useState("");
    const [inputFile, setInputFile] = useState(null);
    const [outputFile, setOutputFile] = useState(null);
    const inputRef = useRef(null);
    const outputRef = useRef(null);
    const { id } = useParams();

    const handleUpload = async () => {
        if (!inputFile || !outputFile) {
            setSuccess("Please select both files.");
            return;
        }

        const formData = new FormData();
        formData.append("problem", id);
        formData.append("input_file", inputFile);
        formData.append("output_file", outputFile);
        formData.append("is_sample", isSample);

        try {
            const res = await API.post("/api/testcases/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setSuccess("✅ Test case uploaded successfully!");
            setInputFile(null);
            setOutputFile(null);
            // Reset file inputs
            if (inputRef.current) inputRef.current.value = "";
            if (outputRef.current) outputRef.current.value = "";

            // Optional: Clear success after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error uploading test case:", err.response?.data || err.message);
            setSuccess("❌ Upload failed. Check console.");
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="font-medium">Input File:</p><br />
                <input
                    id="input_file"
                    type="file"
                    ref={inputRef}
                    onChange={e => setInputFile(e.target.files[0])}
                />
            </div>

            <div>
                <p className="font-medium">Output File:</p><br />
                <input
                    id="output_file"
                    type="file"
                    ref={outputRef}
                    onChange={e => setOutputFile(e.target.files[0])}
                />
            </div>

            <button
                type="button"
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
            >
                Upload
            </button>

            {success && (
                <div className="text-sm text-green-600 font-medium">{success}</div>
            )}
        </div>
    );
}

export default TestCaseUpload;
