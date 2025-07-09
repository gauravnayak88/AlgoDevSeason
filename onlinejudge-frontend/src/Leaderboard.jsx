import React, { useEffect, useState } from 'react';
import API from './api';

// Crown/medal icons for top 3
const rankIcon = (rank) => {
    if (rank === 1) return <span className="text-yellow-400 text-xl mr-2">🥇</span>;
    if (rank === 2) return <span className="text-gray-400 text-xl mr-2">🥈</span>;
    if (rank === 3) return <span className="text-orange-500 text-xl mr-2">🥉</span>;
    return null;
};

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Fetch current user's profile
        API.get('/api/profile/')  // ← or your user info endpoint
            .then(res => setCurrentUser(res.data.username))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        API.get('/api/leaderboard/')
            .then(res => setLeaderboard(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900 drop-shadow">🏆 Leaderboard</h2>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-4 text-lg text-gray-600">Loading...</span>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 text-lg">
                        No leaderboard data yet.
                    </div>
                ) : (
                    <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                        <thead className="bg-blue-50 text-blue-900 text-left">
                            <tr>
                                <th className="py-3 px-4">Rank</th>
                                <th className="py-3 px-4">Username</th>
                                <th className="py-3 px-4">Problems Solved</th>
                                <th className="py-3 px-4">Score</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {leaderboard.map((user, index) => {
                                const username = user.written_by || user.username;
                                const isCurrent = username === currentUser;

                                return (
                                    <tr
                                        key={username}
                                        className={`
                    border-t
                    ${index % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}
                    ${index < 3 ? 'font-bold text-blue-800' : ''}
                    ${isCurrent ? 'bg-yellow-100 font-semibold text-black' : ''}
                    hover:bg-blue-100/60 transition
                `}
                                    >
                                        <td className="py-3 px-4 flex items-center">
                                            {rankIcon(index + 1)}
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4 font-medium">{username}</td>
                                        <td className="py-3 px-4">{user.solved_count}</td>
                                        <td className="py-3 px-4">{user.score}</td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
