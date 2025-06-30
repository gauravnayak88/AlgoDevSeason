
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Problems</h2>
                {isAuthenticated && profile?.role === 'staff' && (
                    <Link to="/addproblem">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            Contribute a problem
                        </button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                {problems.map(p => (
                    <Link to={`/problems/${p.id}`} key={p.id}>
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-200 hover:border-gray-300 transition">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.name}</h3>
                            <span
                                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${p.difficulty.toLowerCase() === 'easy'
                                        ? 'bg-green-100 text-green-700'
                                        : p.difficulty.toLowerCase() === 'medium'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                {p.difficulty}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ProblemList;
