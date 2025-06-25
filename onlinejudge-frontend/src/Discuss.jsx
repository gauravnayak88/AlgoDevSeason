import { useEffect, useState } from "react"
import API from "./api"
import { Link } from "react-router-dom"

function Discuss() {
    const [discussions, setDiscussions] = useState(null)


    useEffect(() => {
        API.get(`/api/discuss/`)
            .then(res => { setDiscussions(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    if (!discussions) return <p>Loading...</p>

    return (
        <div>
            <h2>Discussions</h2>
            <ul>
                {discussions.map((disc) =>
                    <li key={disc.id}>
                        <h3>{disc.title}</h3>
                        <p>{disc.content}</p>
                        <Link to={`/discuss/${disc.id}`}><button>View</button></Link>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default Discuss