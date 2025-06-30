import { useEffect, useState } from "react";
import React from "react";
import API from "./api";
import { Link } from "react-router-dom";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState(null);
    const [solvedProblems, setSolvedProblems] = useState(null);

    useEffect(() => {
        API.get('/api/profile/')
            .then((res) => {
                setProfile(res.data)
            }).catch(err => { console.log(err) }).finally(() => { setLoading(false) })
    }, [])

    useEffect(() => {
        API.get('/api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        API.get('/api/problems/solved')
            .then(res => setSolvedProblems(res.data))
            .catch(err => console.log(err));
    }, [profile]);


    if (!profile || loading) return <p>Loading... </p>

    if (profile?.role === 'staff' && !problems) return <p>Loading... </p>

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{profile.username}</h2>

            <p className="text-gray-600 mb-1">
                <span className="font-medium">Email:</span> {profile.email}
            </p>
            <p className="text-gray-600 mb-1">
                <span className="font-medium">Join Date:</span> {profile.join_date}
            </p>
            <p className="text-gray-600 mb-4">
                <span className="font-medium">Role:</span> {profile.role}
            </p>

            {/* Contributed Problems */}
            {profile.role === 'staff' && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Problems Contributed</h3>
                    <div className="max-h-52 overflow-y-auto border rounded-md p-3 bg-gray-50">
                        <ul className="space-y-2">
                            {problems
                                .filter(problem => problem.written_by === profile.username)
                                .map(problem => (
                                    <li key={problem.id} className="flex justify-between items-center bg-white p-3 rounded shadow">
                                        <p className="text-gray-800">{problem.name}</p>
                                        <div className="flex gap-2">
                                            <Link to={`/problems/${problem.id}/edit`}>
                                                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                                    Edit
                                                </button>
                                            </Link>
                                            <Link>
                                                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                                    Delete
                                                </button>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Solved Problems */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Problems Solved</h3>
                <div className="max-h-52 overflow-y-auto border rounded-md p-3 bg-gray-50">
                    <ul className="space-y-2">
                        {solvedProblems && solvedProblems.map(prob => (
                            <li key={prob.id}>
                                <Link
                                    to={`/problems/${prob.id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {prob.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Profile;