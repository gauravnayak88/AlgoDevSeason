import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "./api";

function TestCaseUpload({ isSample }) {
    const [inputFile, setInputFile] = useState(null);
    const [outputFile, setOutputFile] = useState(null);
    const { id } = useParams();

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("problem", id); // Must be numeric ID, not name
        formData.append("input_file", inputFile); // File object
        formData.append("output_file", outputFile); // File object
        formData.append("is_sample", isSample); // true/false

        try {
            const res = await API.post("/api/testcases/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Success:", res.data);
        } catch (err) {
            console.error("Error uploading test case:", err.response?.data || err.message);
        }
    };

    return (
        <div className="space-y-2">
            <label htmlFor="input_file">Input files</label><br />
            <input id="input_file" type="file" onChange={e => setInputFile(e.target.files[0])} /><br />
            <label htmlFor="output_file">Output files</label><br />
            <input id="output_file" type="file" onChange={e => setOutputFile(e.target.files[0])} />
            <button type="button" onClick={handleUpload} className="bg-blue-600 text-white px-3 py-1 rounded">
                Upload
            </button>
        </div>
    );
}

export default TestCaseUpload;