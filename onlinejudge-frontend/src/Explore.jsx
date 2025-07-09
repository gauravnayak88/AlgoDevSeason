import { useEffect, useState } from "react";
import API from './api';
import { Link } from "react-router-dom";

// Optional: Heroicons for UI polish
const ChevronIcon = ({ open }) => (
    <svg
        className={`w-6 h-6 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const DifficultyIcon = ({ difficulty }) => {
    if (difficulty === "easy") return (
        <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" />
        </svg>
    );
    if (difficulty === "medium") return (
        <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" />
            <circle cx="10" cy="10" r="5" fill="white" />
        </svg>
    );
    return (
        <svg className="w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
};

function Explore() {
    const [topics, setTopics] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [topicWiseProblems, setTopicWiseProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const [expandedTopics, setExpandedTopics] = useState({}); // key: topic.id, value: boolean

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
        if (profile) {
            API.get('/api/problems/solved')
                .then(res => setSolvedProblems(res.data))
                .catch(err => console.log(err));
        }
    }
        , [profile])

    useEffect(() => {
        API.get(`/api/topics/`)
            .then((res) => setTopics(res.data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (topics) {
            setTopicWiseProblems([]);
            setExpandedTopics(
                topics.reduce((acc, topic) => {
                    acc[topic.id] = true; // default: all expanded
                    return acc;
                }, {})
            );
            const fetchAllProblems = async () => {
                try {
                    const responses = await Promise.all(
                        topics.map(topic =>
                            API.get(`/api/topics/${topic.id}/problems`)
                                .then(res => ({
                                    topic,
                                    problems: res.data
                                }))
                        )
                    );
                    setTopicWiseProblems(responses);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchAllProblems();
        }
    }, [topics]);

    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

    const filteredTopicWiseProblems = topicWiseProblems
        .map(item => ({
            topic: item.topic,
            problems: item.problems
                .filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (difficultyFilter === "" || p.difficulty.toLowerCase() === difficultyFilter)
                )
                .sort((a, b) =>
                    difficultyOrder[a.difficulty.toLowerCase()] -
                    difficultyOrder[b.difficulty.toLowerCase()]
                )
        }))
        .filter(item => item.problems.length > 0);

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    if (!topics) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Loading topics...</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍 Search problems..."
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

            {/* Topics and Problems */}
            <ul className="space-y-6">
                {filteredTopicWiseProblems.map((item, index) => (
                    <li
                        key={item.topic.id}
                        className="bg-gradient-to-tr from-blue-50 via-white to-blue-100 shadow-xl rounded-2xl border border-blue-100 transition"
                    >
                        {/* Topic Header */}
                        <button
                            className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
                            onClick={() => toggleTopic(item.topic.id)}
                            aria-expanded={expandedTopics[item.topic.id]}
                            aria-controls={`topic-panel-${item.topic.id}`}
                        >
                            <div className="flex items-center">
                                <span className="inline-block bg-blue-600 text-white text-lg font-bold px-4 py-2 rounded-lg shadow">
                                    {item.topic.name}
                                </span>
                                <span className="ml-3 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">{item.problems.length} problems</span>
                            </div>
                            <ChevronIcon open={expandedTopics[item.topic.id]} />
                        </button>
                        {/* Problems List */}
                        {expandedTopics[item.topic.id] && (
                            <ul
                                id={`topic-panel-${item.topic.id}`}
                                className="divide-y divide-blue-100 px-4 pb-4"
                            >
                                {item.problems.map((p, idx) => {
                                    const isSolved = solvedProblems.some(sp => sp.id === p.id)
                                    return (
                                        <li key={p.id}>
                                            <Link
                                                to={`/problems/${p.id}`}
                                                className="relative flex items-center justify-between gap-2 py-4 px-2 rounded-lg hover:bg-blue-50 transition group"
                                            >
                                                <div className="flex items-center">
                                                    <DifficultyIcon difficulty={p.difficulty.toLowerCase()} />
                                                    {isSolved && (
                                                        <div className="text-green-600 ml-2" title="Accepted">
                                                            <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <span className="ml-2 text-base font-semibold text-blue-800 group-hover:text-blue-600 transition">
                                                        {p.name}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-xs font-bold px-3 py-1 rounded-full border
                                                    ${p.difficulty === 'easy'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : p.difficulty === 'medium'
                                                                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                >
                                                    {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                                                </span>
                                            </Link>
                                        </li>
                                    )
                                }
                                )}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            {filteredTopicWiseProblems.length === 0 && (
                <div className="mt-16 text-center text-gray-500 text-lg">
                    <span>No problems found for your search and filter criteria.</span>
                </div>
            )}
        </div>
    );
}

export default Explore;
