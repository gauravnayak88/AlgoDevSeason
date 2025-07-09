import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from './api';

// Difficulty icon component
const DifficultyIcon = ({ difficulty }) => {
    if (difficulty === "easy") return (
        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" />
        </svg>
    );
    if (difficulty === "medium") return (
        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" />
            <circle cx="10" cy="10" r="5" fill="white" />
        </svg>
    );
    return (
        <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
};

function ProblemList() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [problems, setProblems] = useState([]);
    const [profile, setProfile] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const [solvedProblems, setSolvedProblems] = useState([])

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
        API.get('api/problems/practice')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (profile) {
            if (profile.role === 'staff') {
                API.get('api/problems/')
                    .then(res => setProblems(res.data))
                    .catch(err => console.log(err));
            }

            API.get('/api/problems/solved')
                .then(res => setSolvedProblems(res.data))
                .catch(err => console.log(err));
        }
    }
        , [profile])

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === "" || p.difficulty.toLowerCase() === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (!problems)
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg text-gray-600">Loading problems...</span>
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header and Filters */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Problems</h2>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="🔍 Search by name or difficulty"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                </div>
                <div className="w-full md:w-56">
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                        id="difficulty"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    >
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>


            {/* Contribute Button */}
            {isAuthenticated && profile?.role === 'staff' && (
                <Link to="/addproblem">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold mb-6">
                        + Contribute a problem
                    </button>
                </Link>
            )}

            {/* Problems List */}
            {filteredProblems.length === 0 ? (
                <div className="mt-16 text-center text-gray-500 text-lg">
                    <span>No problems match your search.</span>
                </div>
            ) : (
                <ul className="space-y-6">
                    {filteredProblems.map(p => {
                        const isSolved = solvedProblems.some(sp => sp.id === p.id);
                        return (
                            <li key={p.id}>
                                <Link to={`/problems/${p.id}`}>
                                    <div className="relative bg-gradient-to-tr from-blue-50 via-white to-blue-100 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl hover:border-blue-200 transition p-6 flex flex-col gap-2">
                                        {isSolved && (
                                            <div className="absolute top-2 right-2 text-green-600" title="Accepted">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex items-center mb-2">
                                            <DifficultyIcon difficulty={p.difficulty.toLowerCase()} />
                                            <span className="text-lg font-semibold text-blue-900">{p.name}</span>
                                        </div>
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-bold rounded-full border self-start
                                            ${p.difficulty.toLowerCase() === 'easy'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : p.difficulty.toLowerCase() === 'medium'
                                                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}
                                        >
                                            {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                                        </span>
                                        {p.topics && p.topics.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {p.topics.map((topic, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                    >
                                                        {topic.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        )
                    }
                    )}
                </ul>
            )}
        </div>
    );
}

export default ProblemList;
