import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from './api';

function ProblemList() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [problems, setProblems] = useState([]);
    const [profile, setProfile] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  // 🆕 Search state
    const [difficultyFilter, setDifficultyFilter] = useState("");  // "" = All

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        API.get(`/api/profile/`)
            .then(res => setProfile(res.data))
            .catch(err => console.log(err));
    }, [isAuthenticated]);

    useEffect(() => {
        API.get('api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, []);

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === "" || p.difficulty.toLowerCase() === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (!problems) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Problems</h2>

                <input
                    type="text"
                    placeholder="Search by name or difficulty"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 rounded border border-gray-300 w-full md:w-64 focus:outline-none focus:ring focus:ring-blue-200"
                />

                <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
                >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

            </div>
            {isAuthenticated && profile?.role === 'staff' && (
                <Link to="/addproblem">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Contribute a problem
                    </button>
                    <br />
                    <br />
                </Link>
            )}

            {filteredProblems.length === 0 ? (
                <p className="text-gray-600">No problems match your search.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                    {filteredProblems.map(p => (
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
                                {p.topics && p.topics.length > 0 && (
                                    <div className="mb-4">
                                        <strong className="text-sm text-gray-600">Tags:</strong>{" "}
                                        {p.topics.map((topic, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mt-1"
                                            >
                                                {topic.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProblemList;
