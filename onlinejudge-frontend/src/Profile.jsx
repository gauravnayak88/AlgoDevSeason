import { useEffect, useState } from "react";
import React from "react";
import API from "./api";
import { Link } from "react-router-dom";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState(null);
    const [solvedProblems, setSolvedProblems] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        API.get('/api/profile/')
            .then((res) => setProfile(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        API.get('/api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (profile) {
            API.get('/api/problems/solved')
                .then(res => setSolvedProblems(res.data))
                .catch(err => console.log(err));

            API.get('/api/solutions/')
                .then(res => {
                    // Filter only current user's submissions
                    const userSubs = res.data.filter(s => s.written_by === profile.username);
                    setSubmissions(userSubs);
                })
                .catch(err => console.log(err));
        }
    }, [profile]);

    if (!profile || loading) return <p>Loading... </p>
    if (profile?.role === 'staff' && !problems) return <p>Loading... </p>

    // Count unique problems attempted
    const attemptedProblemIds = new Set(submissions.map(s => s.problem)).size;

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10 flex flex-col md:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{profile.username}</h2>
                <p className="text-gray-600 mb-1"><span className="font-medium">Email:</span> {profile.email}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">Join Date:</span> {profile.join_date}</p>
                <p className="text-gray-600 mb-4"><span className="font-medium">Role:</span> {profile.role}</p>

                {/* Attempt/Solve Stats */}
                <div className="mb-6">
                    <p className="text-lg font-semibold text-gray-800 mb-1">📊 Stats:</p>
                    <p className="text-gray-700">Problems Attempted: <strong>{attemptedProblemIds}</strong></p>
                    <p className="text-gray-700">Problems Solved: <strong>{solvedProblems?.length || 0}</strong></p>
                </div>

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
                                                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                                                </Link>
                                                <Link>
                                                    <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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

            {/* Sidebar: Submissions */}
            <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow border max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📥 Submissions</h3>
                <ul className="space-y-3 text-sm">
                    {submissions.map(sub => (
                        <li key={sub.id} className="border rounded px-3 py-2 bg-white shadow-sm">
                            <Link to={`/solutions/${sub.id}`} className="font-medium text-blue-700 hover:underline">
                                {problems?.find(p => p.id === sub.problem)?.name || `Problem #${sub.problem}`}
                            </Link>
                            <p className="text-gray-700">
                                Verdict: <span className={`${sub.verdict === "Accepted" ? "text-green-600" : "text-red-600"}`}>{sub.verdict}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Profile;
