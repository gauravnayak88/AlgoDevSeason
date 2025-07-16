import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContestAdminPanel from "./ContestAdminPanel";
import API from "./api";

function Contests() {
    const [profile, setProfile] = useState(null);
    const [contests, setContests] = useState([]);
    const [now, setNow] = useState(new Date());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const [joinedContestIds, setJoinedContestIds] = useState(new Set());


    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        API.get('/api/profile/')
            .then((res) => setProfile(res.data))
            .catch(err => console.log(err));
    }, []);


    useEffect(() => {
        const token = localStorage.getItem("access");
        setIsAuthenticated(!!token);

        API.get("/api/contests/")
            .then(res => setContests(res.data))
            .catch(err => console.error(err));

        if (token) {
            API.get("/api/contests/joined/")
                .then(res => {
                    const joinedIds = res.data.map(c => c.id);
                    setJoinedContestIds(new Set(joinedIds));
                })
                .catch(err => console.error("Failed to fetch joined contests", err));
        }
    }, []);

    function formatDuration(ms) {
        if (ms <= 0) return "0s";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    const handleJoin = (contestId) => {
        if (!isAuthenticated) {
            alert("Please log in to join the contest.");
            navigate("/login");
            return;
        }

        API.post(`/api/contests/${contestId}/join/`)
            .then(() => {
                return Promise.all([
                    API.get("/api/contests/"),
                    API.get("/api/contests/joined/")
                ]);
            })
            .then(([allRes, joinedRes]) => {
                setContests(allRes.data);
                setJoinedContestIds(new Set(joinedRes.data.map(c => c.id)));
            })
            .catch(err => {
                alert("Error joining contest.");
                console.error(err);
            });

    };

    if (!isAuthenticated) return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Contests</h2>
            <Link to={'/login'} className="text-blue-900">Log in to view contests</Link>
        </div>
    )

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Contests</h2>
            {isAuthenticated && profile?.role == 'staff' &&
            <Link to={'/admin/contests'}><button>Go to contest admin panel</button></Link>
            }
            {contests.length === 0 ? (
                <p>Loading contests...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contests.map(contest => {
                        const start = new Date(contest.start_time);
                        const end = new Date(contest.end_time);
                        const hasStarted = now >= start;
                        const hasEnded = now > end;
                        const isJoined = joinedContestIds.has(contest.id);

                        return (
                            <div
                                key={contest.id}
                                className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100 hover:-translate-y-1 hover:shadow-2xl transition transform duration-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-blue-700">{contest.name}</h3>
                                    <span className="text-sm text-gray-500">By {contest.created_by}</span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                    {!hasStarted ? (
                                        <>🕒 Starts in: <span className="font-semibold">{formatDuration(start - now)}</span></>
                                    ) : !hasEnded ? (
                                        <>⏳ Ends in: <span className="font-semibold">{formatDuration(end - now)}</span></>
                                    ) : (
                                        <span className="text-red-500 font-semibold">❌ Contest Ended</span>
                                    )}
                                </p>

                                <p className="text-sm text-gray-700">
                                    Start: {start.toLocaleString()}<br />
                                    End: {end.toLocaleString()}
                                </p>

                                <p className="text-gray-600 mt-2">
                                    {contest.problems.length} problems
                                </p>

                                {/* <ul className="mt-2 text-sm text-gray-800 list-disc ml-4">
                                    {(!isJoined && !hasEnded) && contest.problems.map(problem => (
                                        <li key={problem.id}>{problem.name}</li>
                                    ))}
                                </ul> */}

                                {!isJoined && !hasEnded && (
                                    <button
                                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        onClick={() => handleJoin(contest.id)}
                                    >
                                        Join Contest
                                    </button>
                                )}

                                {contest.is_started && (isJoined) && (!hasEnded) && (
                                    <Link to={`/contests/${contest.id}`}>
                                        <button className="mt-4 ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                            Goto Contest
                                        </button>
                                    </Link>
                                )}

                                {hasEnded && (
                                    <Link to={`/contests/${contest.id}`}>
                                        <button className="mt-4 ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                            View Contest
                                        </button>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Contests;
