import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import API from "./api";
import { useNavigate } from "react-router-dom";

function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [language, setLanguage] = useState("python");
    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
            axios.get(`http://localhost:8000/api/problems/${id}/`)
                .then(res => setProblem(res.data))
                .catch(err => console.error(err));
        }, 1000)
        // axios.get(`http://localhost:8000/api/problems/${id}/`)
        //     .then(res => setProblem(res.data))
        //     .catch(err => console.error(err));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        API.post('/api/solutions/', {
            problem: id,
            language: language,
            code: code,
        })
            .then(() => {setMessage("Submitted successfully!")
                    navigate('/problems')
            })
            .catch(() => setMessage("Submission failed."));
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
        <div>
            <h2>ProblemDetails</h2>
            <h2>{problem.name}</h2>
            <p><strong>Difficulty: </strong>{problem.difficulty}</p>
            <p><em>Contributed by {problem.written_by}</em></p>
            <button onClick={() => navigate(`/problems/${id}/edit`)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
            <p>{problem.statement}</p>
            <Link to={`/problems/${problem.id}/solutions`}><button>View Submissions</button></Link>
            <form onSubmit={handleSubmit}>
                <h3>Submit your solution</h3>

                <label>Select Language: </label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    {/* Match the keys from your LANGUAGES choices in Django */}
                </select>
                <br /><br />

                <textarea
                    rows={10}
                    cols={60}
                    placeholder="Write your code here..."
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default ProblemDetail;