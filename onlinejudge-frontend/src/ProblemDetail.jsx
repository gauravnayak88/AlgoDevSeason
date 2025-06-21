import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

function ProblemDetail() {
    const { id } = useParams();
    const [ problem, setProblem ] = useState(null);

    useEffect(() => {
        setTimeout(()=>{axios.get(`http://localhost:8000/api/problems/${id}/`)
            .then(res => setProblem(res.data))
            .catch(err => console.error(err));}, 1000)
        // axios.get(`http://localhost:8000/api/problems/${id}/`)
        //     .then(res => setProblem(res.data))
        //     .catch(err => console.error(err));
    }, [id]);

    if (!problem) return <p>Loading</p>;

    return (
        <div>
            <h2>ProblemDetails</h2>
            <h2>{problem.name}</h2>
            <p><strong>Difficulty: </strong>{problem.difficulty}</p>
            <p><em>Contributed by {problem.written_by}</em></p>
            <p>{problem.statement}</p>
        </div>
    );
}

export default ProblemDetail;