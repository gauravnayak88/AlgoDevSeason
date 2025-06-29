import { useEffect, useState } from "react"
import API from './api'
import { Link } from "react-router-dom"

function Explore() {
    const [topics, setTopics] = useState(null)
    const [topicWiseProblems, setTopicWiseProblems] = useState([])


    useEffect(() => {
        API.get(`/api/topics/`)
            .then((res) => {
                setTopics(res.data)
            })
            .catch((err) => { console.log(err) })
    }, [])

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
                }
                catch (err) {
                    console.log(err)
                }
            }

            fetchAllProblems()
        }
    }, [topics])

    if (!topics) return <p>Loading...</p>

    return (
        <div>
            <ul>
                {topicWiseProblems.map((item, index) =>
                    <li key={index}>
                        <h2>{item.topic.name}</h2>
                        <ul>
                            {item.problems.map((p, index) =>
                                <li key={index}>
                                    <Link to={`/problems/${p.id}`}>
                                        <strong>{p.name}</strong> - ({p.difficulty})
                                    </Link>
                                </li>
                            )
                            }
                        </ul>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default Explore