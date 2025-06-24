import { useEffect, useState } from "react";
import React from "react";
import API from "./api";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        API.get('/api/profile/')
        .then((res)=> {
            setProfile(res.data)
        }).catch(err=>{console.log(err)}).finally(()=> {setLoading(false)})
    }, [])


    if (!profile || loading) return <p>Loading... </p>

    return (
    <div>
        <h2>{profile.username}</h2>
        <p>Email: {profile.email}</p>
        <p>Join Date: {profile.join_date}</p>
        <p>Role: {profile.role}</p>
    </div>
    )
}

export default Profile;