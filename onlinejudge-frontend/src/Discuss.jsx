import { useEffect, useState } from "react"
import API from "./api"
import { Link } from "react-router-dom"

function Discuss() {
    const [discussions, setDiscussions] = useState(null)


    useEffect(() => {
        API.get(`/api/discussions/`)
            .then(res => { setDiscussions(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    if (!discussions) return <p>Loading...</p>

    return (
        <div>
            <h2>Discussions</h2>
            <Link to={'/discuss/post'}><button>Post</button></Link>
            <ul>
                {discussions.map((disc) => {
                    const formattedDate = new Date(disc.posted_on).toLocaleString("en-IN", options);
                    return (
                        <li key={disc.id}>
                            <h3>{disc.title}</h3>
                            <p>{disc.written_by}</p>
                            <p>{formattedDate}</p>
                            <p>{disc.content.length > 50 ? disc.content.slice(0, 50) + "..." : disc.content}</p>
                            <Link to={`/discuss/${disc.id}`}><button>View</button></Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Discuss