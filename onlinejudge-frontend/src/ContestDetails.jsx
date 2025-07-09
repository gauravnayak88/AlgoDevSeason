import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "./api";
import ProblemDetailInline from "./ProblemDetailInline";
import ContestLeaderboard from "./ContestLeaderboard";

function ContestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [solvedProblems, setSolvedProblems] = useState(null);
    const [joinedContestIds, setJoinedContestIds] = useState(new Set());
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [profile, setProfile] = useState(null);
    const [now, setNow] = useState(new Date());


    const isJoined = joinedContestIds.has(parseInt(id));

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        API.get("/api/profile/")
            .then(res => setProfile(res.data))
            .catch(err => console.log(err));
    }, [isAuthenticated]);

    useEffect(() => {
        if (profile) {
            API.get('/api/problems/solved')
                .then(res => setSolvedProblems(res.data))
                .catch(err => console.log(err));
        }
    }, [profile]);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            API.get("/api/contests/joined/")
                .then(res => {
                    const ids = res.data.map(contest => contest.id);
                    setJoinedContestIds(new Set(ids));
                })
                .catch(err => console.error("Failed to fetch joined contests", err));
        }
    }, []);

    useEffect(() => {
        API.get(`/api/contests/${id}/`)
            .then(res => {
                const contestData = res.data;
                setContest(contestData);

                if ((isJoined || contestData.is_ended) && contestData.problems.length > 0) {
                    setSelectedProblem(contestData.problems[0]);
                }
            })
            .catch(err => console.error(err));
    }, [id, isJoined]);

    function formatDuration(ms) {
        if (ms <= 0) return "0s";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (!contest) return <p className="p-6">Loading...</p>;

    const formattedStartTime = new Date(contest.start_time).toLocaleString("en-IN");
    const formattedEndTime = new Date(contest.end_time).toLocaleString("en-IN");

    if (!contest.is_started) {
        return (
            <div className="p-6 text-center text-gray-700">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">⏳ Contest has not started yet</h2>
                <p>It will begin at <strong>{formattedStartTime}</strong>.</p>
            </div>
        );
    }

    if (!isJoined && !contest.is_ended) {
        return (
            <div className="p-6 text-center text-gray-700">
                <h2 className="text-xl font-semibold text-orange-600 mb-2">🚫 You have not joined this contest</h2>
                <p>Please go back to the <a href="/contests" className="text-blue-600 underline">contests page</a> and join to participate.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto mt-6 gap-6 p-4">
            {/* Left Panel */}
            <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{contest.name}</h2>
                <p className="text-sm text-gray-600 mb-2">
                    {now < new Date(contest.start_time) ? (
                        <>🕒 Starts in: <span className="font-semibold">{formatDuration(new Date(contest.start_time) - now)}</span></>
                    ) : now < new Date(contest.end_time) ? (
                        <>⏳ Ends in: <span className="font-semibold">{formatDuration(new Date(contest.end_time) - now)}</span></>
                    ) : (
                        <span className="text-red-500 font-semibold">❌ Contest Ended</span>
                    )}
                </p>
                <p className="text-sm text-gray-600 mb-1">Start: {formattedStartTime}</p>
                <p className="text-sm text-gray-600 mb-4">End: {formattedEndTime}</p>
                <p className="text-sm text-gray-600 mb-4">Created by: {contest.created_by}</p>

                <h3 className="text-lg font-semibold text-gray-700 mb-2">Problems</h3>
                <ul className="space-y-2">
                    {contest.problems.map((problem) => {
                        const isSelected = selectedProblem?.id === problem.id;

                        return (
                            <li key={problem.id}>
                                <button
                                    className={`
                                        w-full text-left px-3 py-2 rounded transition-colors
                                        ${solvedProblems?.some(sp => sp.id === problem.id)
                                            ? "bg-green-200 hover:bg-green-300 font-semibold"
                                            : isSelected
                                                ? "bg-blue-200 hover:bg-blue-300 font-semibold"
                                                : "bg-gray-100 hover:bg-blue-100"}
                                    `}
                                    onClick={() => setSelectedProblem(problem)}
                                >
                                    {problem.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Right: Selected Problem */}
            <div className="lg:w-2/3 bg-white p-4 rounded-lg shadow relative">
                <button
                    className="absolute top-4 right-4 text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={() => {
                        setShowLeaderboard(prev => !prev);
                        if (showLeaderboard) {
                            setSelectedProblem(null); // deselect problem if leaderboard was showing
                        }
                    }}
                >
                    {showLeaderboard ? "📘 View Problem" : "📊 View Leaderboard"}
                </button>

                {showLeaderboard ? (
                    <ContestLeaderboard contestId={contest.id} />
                ) : selectedProblem ? (
                    <ProblemDetailInline
                        profile={profile}
                        problem={selectedProblem}
                        isSolved={solvedProblems?.some(sp => sp.id === selectedProblem?.id)}
                        isEnded={contest?.is_ended}
                    />
                ) : (
                    <p className="text-gray-500">Select a problem to view details.</p>
                )}
            </div>
        </div>
    );
}

export default ContestDetails;
