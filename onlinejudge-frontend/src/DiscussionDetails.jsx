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

    if (!discussion) return <p>Loading...</p>

    return (
        <div>
            <h2>Discussion</h2>
            <h3>{discussion.title}</h3>
            <p>{discussion.content}</p>
        </div>
    )
}

export default Discuss