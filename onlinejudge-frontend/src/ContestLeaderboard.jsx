import { useState, useEffect } from "react";
import API from "./api";

export default function ContestLeaderboard({ contestId }) {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = () => {
            API.get(`/api/contests/${contestId}/leaderboard/`)
                .then(res => setLeaders(res.data))
                .catch(err => console.error("Leaderboard error", err));
        };

        fetchLeaderboard(); // initial fetch
        const interval = setInterval(fetchLeaderboard, 10000); // every 10 seconds
        return () => clearInterval(interval); // cleanup
    }, [contestId]);

    return (
        <div className="bg-white rounded p-4 shadow mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Leaderboard</h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">#</th>
                        <th className="py-2">User</th>
                        <th className="py-2">Score</th>
                        <th className="py-2">Solved</th>
                        <th className="py-2">Last Submission</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((entry, index) => (
                        <tr key={index} className="border-b">
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">{entry.user}</td>
                            <td className="py-2">{entry.score}</td>
                            <td className="py-2">{entry.solved_problems.length}</td>
                            <td className="py-2">{new Date(entry.last_submission_time).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
