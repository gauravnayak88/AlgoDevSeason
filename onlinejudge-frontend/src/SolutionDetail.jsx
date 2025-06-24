import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "./api";

function SolutionDetail () {
    const { id } = useParams();
    const [solution, setSolution] = useState(null);
    
    useEffect(()=> {
        API.get(`/api/solutions/${id}`)
        .then(res=> {
            setSolution(res.data)
        })
        .catch(err=> {console.log(err)})
    }, [id])

    if (!solution) return <p>Loading...</p>

    // Submission date and time formatting
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const formattedDate = new Date(solution.submitted_at).toLocaleString("en-IN", options);

    return (
        <div>
        <p>Language: {solution.language}</p>
        <p>Verdict: {solution.verdict}</p>
        <p>Code: </p>
        <p>{solution.code}</p>
        <p>Written By: {solution.written_by}</p>
        <p>Submitted At: {formattedDate}</p>
        </div>
    )
}

export default SolutionDetail;