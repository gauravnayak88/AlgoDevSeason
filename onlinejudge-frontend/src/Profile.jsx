import { useEffect, useState } from "react";
import React from "react";
import API from "./api";
import { Link } from "react-router-dom";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState(null);

    useEffect(()=> {
        API.get('/api/profile/')
        .then((res)=> {
            setProfile(res.data)
        }).catch(err=>{console.log(err)}).finally(()=> {setLoading(false)})
    }, [])

    useEffect(() => {
        API.get('api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, [])


    if (!profile || loading) return <p>Loading... </p>

    if (profile?.role === 'staff' && !problems) return <p>Loading... </p>

    return (
    <div>
        <h2>{profile.username}</h2>
        <p>Email: {profile.email}</p>
        <p>Join Date: {profile.join_date}</p>
        <p>Role: {profile.role}</p>

        {profile.role === 'staff' && <h2>Problems contributed</h2>}
        <ul>
        {profile.role === 'staff' && 
        problems.map((problem)=> {
            return problem.written_by === profile.username ? (
            <li key={problem.id}>
                <p>{problem.name}</p>
                <Link to={`/problems/${problem.id}/edit`}><button>Edit</button></Link>
                <Link><button>Delete</button></Link>
            </li>): 
            (<></>)
        })}
        </ul>
    </div>
    )
}

export default Profile;