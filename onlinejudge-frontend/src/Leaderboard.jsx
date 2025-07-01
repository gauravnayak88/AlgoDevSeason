import React, { useEffect, useState } from 'react';
import API from './api';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        API.get('/api/leaderboard/')
            .then(res => setLeaderboard(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">🏆 Leaderboard</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                    <thead className="bg-gray-200 text-gray-700 text-left">
                        <tr>
                            <th className="py-3 px-4">Rank</th>
                            <th className="py-3 px-4">Username</th>
                            <th className="py-3 px-4">Problems Solved</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {leaderboard.map((user, index) => (
                            <tr key={user.written_by || user.username} className="border-t">
                                <td className="py-3 px-4">{index + 1}</td>
                                <td className="py-3 px-4 font-medium">{user.written_by || user.username}</td>
                                <td className="py-3 px-4">{user.solved_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Leaderboard;
