import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "./api";

function Solutions() {

    const { id } = useParams()
    const [solutions, setSolution] = useState(null);
    const [profile, setProfile] = useState(null);
    const [own, setOwn] = useState(false);

    useEffect(()=>{
        API.get(`/api/profile/`)
        .then(res=>{setProfile(res.data)})
        .catch(err=>{console.log(err)})
    }, [])

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
        <select id="isown" onChange={(e)=>setOwn(e.target.value == "true")}>
            <option value="false">All</option>
            <option value="true">Mine</option>
        </select>
        <ul>
        {
            solutions.filter(sol => !own || (own && sol.written_by === profile.username )).map((sol)=> {
                const formattedDate = new Date(sol.submitted_at).toLocaleString("en-IN", options);
                // console.log(own)
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