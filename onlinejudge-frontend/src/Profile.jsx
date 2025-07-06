import { useEffect, useState } from "react";
import API from "./api";
import { Link } from "react-router-dom";

const roleColors = {
    staff: "bg-purple-100 text-purple-700 border-purple-300",
    user: "bg-blue-100 text-blue-700 border-blue-300"
};

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

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    if (!profile || loading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Loading profile...</span>
        </div>
    );
    if (profile?.role === 'staff' && !problems) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Loading problems...</span>
        </div>
    );

    // Count unique problems attempted
    const attemptedProblemIds = new Set(submissions.map(s => s.problem)).size;

    const difficultyLevels = ['easy', 'medium', 'hard'];
    const languageNames = { cpp: 'C++', python: 'Python', java: 'Java', c: 'C' };

    // Get total problems by difficulty
    const totalByDifficulty = {};
    difficultyLevels.forEach(level => {
        totalByDifficulty[level] = problems?.filter(p => p.difficulty === level).length || 0;
    });

    // Get solved problems by difficulty
    const solvedByDifficulty = {};
    difficultyLevels.forEach(level => {
        solvedByDifficulty[level] = solvedProblems?.filter(p => p.difficulty === level).length || 0;
    });

    // Get solved problems by language
    const solvedByLanguage = {};
    submissions
        .filter(s => s.verdict === "Accepted")
        .forEach(s => {
            solvedByLanguage[s.language] = (solvedByLanguage[s.language] || new Set()).add(s.problem);
        });

    // Convert to counts
    const solvedByLanguageCount = {};
    for (let lang in solvedByLanguage) {
        solvedByLanguageCount[lang] = solvedByLanguage[lang].size;
    }


    return (
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-10 flex flex-col md:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center text-3xl font-bold text-white shadow">
                        {profile.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
                        <div className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleColors[profile.role] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Joined {new Date(profile.join_date).toLocaleDateString("en-IN", options)}</div>
                    </div>
                </div>
                <p className="text-gray-600 mb-1"><span className="font-medium">Email:</span> {profile.email}</p>

                {/* Attempt/Solve Stats */}
                <div className="mb-6 mt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Progress Summary</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-xl">✅</span>
                            <span>Solved <strong>{solvedProblems?.length || 0}</strong> out of <strong>{problems?.length || 0}</strong> problems</span>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-600 mt-2">By Difficulty:</h4>
                            <ul className="text-sm text-gray-700 ml-4 list-disc">
                                {difficultyLevels.map(level => (
                                    <li key={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}: <strong>{solvedByDifficulty[level]}</strong> / <strong>{totalByDifficulty[level]}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-600 mt-2">By Language:</h4>
                            <ul className="text-sm text-gray-700 ml-4 list-disc">
                                {Object.keys(languageNames).map(lang => (
                                    <li key={lang}>
                                        {languageNames[lang]}: <strong>{solvedByLanguageCount[lang] || 0}</strong> solved
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Contributed Problems */}
                {profile.role === 'staff' && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Problems Contributed</h3>
                        <div className="max-h-52 overflow-y-auto border rounded-md p-3 bg-gray-50">
                            <ul className="space-y-2">
                                {problems
                                    .filter(problem => problem.written_by === profile.username)
                                    .map(problem => (
                                        <li key={problem.id} className="flex justify-between items-center bg-white p-3 rounded shadow border">
                                            <p className="text-gray-800">{problem.name}</p>
                                            <div className="flex gap-2">
                                                <Link to={`/problems/${problem.id}/edit`}>
                                                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                                                </Link>
                                                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700" disabled>Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                {problems.filter(problem => problem.written_by === profile.username).length === 0 && (
                                    <li className="text-gray-400 italic">No contributed problems yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Solved Problems */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Problems Solved</h3>
                    <div className="max-h-52 overflow-y-auto border rounded-md p-3 bg-gray-50">
                        <ul className="space-y-2">
                            {solvedProblems && solvedProblems.length > 0 ? solvedProblems.map(prob => (
                                <li key={prob.id}>
                                    <Link
                                        to={`/problems/${prob.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {prob.name}
                                    </Link>
                                </li>
                            )) : (
                                <li className="text-gray-400 italic">No problems solved yet.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sidebar: Submissions */}
            <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow border max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">📥 Submissions</h3>
                <ul className="space-y-3 text-sm">
                    {submissions.length > 0 ? submissions.map(sub => (
                        <li key={sub.id} className="border rounded-lg px-4 py-3 bg-white shadow-sm">
                            <Link to={`/solutions/${sub.id}`} className="font-semibold text-blue-700 hover:underline">
                                {problems?.find(p => p.id === sub.problem)?.name || `Problem #${sub.problem}`}
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    {sub.language === 'cpp' ? 'C++' : sub.language}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${sub.verdict === "Accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {sub.verdict}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {sub.passed_count} / {sub.total_count} tests
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(sub.submitted_at).toLocaleString("en-IN", options)}
                            </div>
                        </li>
                    )) : (
                        <li className="text-gray-400 italic">No submissions yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Profile;
