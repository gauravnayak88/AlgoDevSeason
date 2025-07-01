import { useEffect, useState } from "react";
import API from './api';
import { Link } from "react-router-dom";

function Explore() {
    const [topics, setTopics] = useState(null);
    const [topicWiseProblems, setTopicWiseProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        API.get(`/api/topics/`)
            .then((res) => setTopics(res.data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (topics) {
            setTopicWiseProblems([]);
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
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .sort((a, b) =>
                    difficultyOrder[a.difficulty.toLowerCase()] -
                    difficultyOrder[b.difficulty.toLowerCase()]
                )
        }))
        .filter(item => item.problems.length > 0);

    if (!topics) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="mb-6 w-full p-2 border border-gray-300 rounded"
            />
            <ul className="space-y-6">
                {filteredTopicWiseProblems.map((item, index) => (
                    <li key={index} className="bg-white shadow rounded-lg border p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{item.topic.name}</h2>
                        <ul className="space-y-2">
                            {item.problems.map((p, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={`/problems/${p.id}`}
                                        className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 transition"
                                    >
                                        <span className="text-lg font-medium text-blue-700">{p.name}</span>
                                        <span
                                            className={`text-sm font-semibold px-3 py-1 rounded-full 
                                                ${p.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                    p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-700'}`}
                                        >
                                            {p.difficulty}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Explore;
