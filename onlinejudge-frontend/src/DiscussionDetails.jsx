import { useEffect, useState } from "react"
import API from "./api"
import { useParams } from "react-router-dom"

function Discuss() {
    const { id } = useParams()
    const [discussion, setDiscussion] = useState(null)


    useEffect(() => {
        API.get(`/api/discuss/${id}`)
            .then(res => { setDiscussion(res.data) })
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

    if (!discussion) return <p>Loading...</p>

    const formattedDate = new Date(discussion.posted_on).toLocaleString("en-IN", options)

    return (
        <div>
            <h2>Discussion</h2>
            <h3>{discussion.title}</h3>
            <p>{discussion.written_by}</p>
            <p>{formattedDate}</p>
            <p>{discussion.content}</p>
        </div>
    )
}

export default Discuss