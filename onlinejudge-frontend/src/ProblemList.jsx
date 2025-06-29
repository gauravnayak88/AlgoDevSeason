
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from './api';

function ProblemList() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [problems, setProblems] = useState([])
    const [profile, setProfile] = useState([])

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
        API.get('api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, [])


    if (!problems) return <p>Loading...</p>
    return (
        <div>
            <h2>Problems</h2>
            {isAuthenticated && profile?.role === 'staff' && (
                <Link to={'/addproblem'}><button>Contribute a problem</button></Link>
            )}
            <ul>
                {problems.map(p => (
                    <li key={p.id}>
                        <Link to={`/problems/${p.id}`}>
                        <strong>{p.name}</strong> - ({p.difficulty})
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ProblemList;
