import { useEffect, useState } from "react"
import API from "./api"
import { useParams, useNavigate, Link } from "react-router-dom"

function Discuss() {
    const { id } = useParams()
    const [discussion, setDiscussion] = useState(null)
    const [comments, setComment] = useState(null)
    const [currentUsername, setCurrentUsername] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        API.get(`/api/discuss/${id}`)
            .then(res => { setDiscussion(res.data) })
            .catch(err => {
                console.log(err)
                console.log("Error")
            })

        // Get current user's username
        API.get('/api/profile/')
            .then(res => setCurrentUsername(res.data.username))
            .catch(err => console.log(err))
    }, [id])

    useEffect(() => {
        API.get(`/api/discussions/${id}/comments`)
        .then(res=>{setComment(res.data)})
        .catch(err=>{console.log(err)})
    })

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this discussion?");
        if (!confirm) return;

        API.delete(`/api/discussions/${id}/`)
            .then(() => navigate("/discuss"))  // Redirect to list after deletion
            .catch(err => console.log("Delete failed", err))
    }

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

    const isOwner = discussion.written_by === currentUsername

    return (
        <div>
            <h2>Discussion</h2>
            <h3>{discussion.title}</h3>
            <p><strong>By:</strong> {discussion.written_by}</p>
            <p><strong>Posted on:</strong> {formattedDate}</p>
            <p>{discussion.content}</p>
            {/* <p>Current user: {currentUsername}</p> */}
            {/* <p>Written by: {discussion.written_by}</p> */}
            {isOwner && (
                <div>
                    <Link to={`/discuss/${id}/edit`}><button>Edit</button></Link>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
            <Link><button>Comment</button></Link>
            <ul>
                {comments?.map((comment)=>
                    <li>
                        <p><b>{comment.written_by}</b>-{comment.posted_on}</p>
                        <p>{comment.content}</p>
                    </li>    
                )}
            </ul>
            <ul>
                <li>
                    <p><b>Username</b></p>
                    <p>Comment...</p>
                </li>
            </ul>
        </div>
    )
}

export default Discuss
