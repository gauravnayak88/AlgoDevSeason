import { Link } from "react-router-dom";
import { CalendarDays, Flame } from "lucide-react"; // optional icons
import { useEffect, useState } from "react";
 

export default function ContestsPage() {
    const [daily, setDaily] = useState(null)
    const [weekly, setWeekly] = useState(null)

    useEffect(() => {
        setDaily(2)
    })

    useEffect(() => {
        setWeekly(4)
    })

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">🔥 Coding Contests</h1>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Challenge */}
                <li className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                            <Flame size={16} /> Daily Challenge
                        </span>
                        <span className="text-xs text-gray-500">⏳ 24 hrs</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Today's Challenge</h2>
                    <p className="text-gray-600 mb-4">
                        Solve a handpicked problem to keep your streak alive and sharpen your skills!
                    </p>
                    <Link to={`/problems/${daily}`}>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Solve Now</button>
                    </Link>
                </li>

                {/* Weekly Challenge */}
                <li className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CalendarDays size={16} /> Weekly Challenge
                        </span>
                        <span className="text-xs text-gray-500">🏁 Ends Sunday</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Weekly Warrior</h2>
                    <p className="text-gray-600 mb-4">
                        A longer, tougher challenge to test your consistency and endurance. Rank higher on the leaderboard!
                    </p>
                    <Link to={`/problems/${weekly}`}>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Take Challenge</button>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
