import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "./api";

function Solutions() {

    const { id } = useParams()
    const [solutions, setSolution] = useState(null);

    useEffect(()=> {
        API.get(`/api/problems/${id}/solutions`)
        .then(res=>{setSolution(res.data)})
        .catch(err=>{console.log(err)})
    }, [])

    if (!solutions) return <p>Loading...</p>

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    return (
    <div>
        <h2>Solutions</h2>
        <ul>
        {
            solutions.map((sol)=> {
                const formattedDate = new Date(sol.submitted_at).toLocaleString("en-IN", options);

                return (
            <li key={sol.id}>
                <p>Language: {sol.language}</p>
                <p>Verdict: {sol.verdict}</p>
                {/* <p>Code: {sol.code}</p> */}
                <Link to={`/solutions/${sol.id}`}><button>View</button></Link>
                <p>Submitted By {sol.written_by} </p>
                <p>Submitted At {formattedDate} </p>
            </li>)
            })
        }
        </ul>
    </div>
)
}

export default Solutions