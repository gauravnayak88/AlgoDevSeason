import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import API from "./api";
import { useNavigate } from "react-router-dom";

function ProblemDetail() {
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [problem, setProblem] = useState(null);
    const [profile, setProfile] = useState(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [language, setLanguage] = useState("python");
    const [input, setInput] = useState("");
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

    const handleSubmit = (e) => {
        e.preventDefault();

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
            .then(() => {
                setMessage("Submitted successfully!")
                navigate(`/problems/${id}`)
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Left Column - Problem Details */}
            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                <h2>{problem.name}</h2>
                <p><strong>Difficulty: </strong>{problem.difficulty}</p>
                <p><em>Contributed by {problem.written_by}</em></p>

                {isAuthenticated && profile?.role === 'staff' && (
                    <>
                        <button onClick={() => navigate(`/problems/${id}/edit`)}>Edit</button>
                        <button onClick={handleDelete}>Delete</button>
                    </>
                )}
                <div style={{
                    whiteSpace: 'pre-wrap',  // preserve line breaks
                    wordWrap: 'break-word',  // break long words
                    overflowWrap: 'break-word', // ensure wrapping even for long strings
                    backgroundColor: '#f9f9f9',
                    padding: '1rem',
                    borderRadius: '5px',
                    marginTop: '1rem'
                }}>{problem.statement}</div>
                <Link to={`/problems/${problem.id}/solutions`}><button>View Submissions</button></Link>
                <Link to={`/problems/${problem.id}/testcases`}><button>View TestCases</button></Link>
            </div>

            {/* Right Column - Submission Form */}
            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
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
                        cols={50}
                        placeholder="Write your code here..."
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        required
                    />
                    <br />
                    <h3>Input: </h3>
                    <textarea onChange={e => setInput(e.target.value)}/>
                    <p>{message}</p>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default ProblemDetail;