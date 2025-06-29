import { useEffect, useState } from "react"
import API from "./api"
import { useParams, useNavigate, Link } from "react-router-dom"

function Discuss() {
    const { id } = useParams()
    const [discussion, setDiscussion] = useState(null)
    const [comments, setComments] = useState(null)
    const [newComment, setNewComment] = useState("")
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");

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
            .then(res => { setComments(res.data) })
            .catch(err => { console.log(err) })
    }, [])

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this discussion?");
        if (!confirm) return;

        API.delete(`/api/discussions/${id}/`)
            .then(() => navigate("/discuss"))  // Redirect to list after deletion
            .catch(err => console.log("Delete failed", err))
    }

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        API.post('/api/comments/', {
            discussion: id,
            content: newComment,
        })
            .then(res => {
                setComments(prev => [res.data, ...prev]);
                setNewComment("");
            })
            .catch(err => console.log(err));
    }

    const handleUpdateComment = (commentId, updatedText) => {
        API.patch(`/api/comments/${commentId}/`, {
            content: updatedText,
        })
            .then(res => {
                setComments(prev => prev.map(c => c.id === commentId ? res.data : c));
                setEditText("")
                setEditingCommentId(null)
            })
            .catch(err => console.log(err));
    };

    function handleEditComment(comment) {
        setEditingCommentId(comment.id);
        setEditText(comment.content);
    }

    const handleDeleteComment = (commentId) => {
        if (!window.confirm("Delete comment?")) return;

        API.delete(`/api/comments/${commentId}/`)
            .then(() => {
                setComments(prev => prev.filter(c => c.id !== commentId));
            })
            .catch(err => console.log(err));
    };

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

            <h3>Comments</h3>
            {currentUsername &&
                <form onSubmit={handleAddComment}>
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        required
                    />
                    <button type="submit">Add Comment</button>
                </form>
            }

            <ul>
                {comments?.map((comment) => (
                    <li key={comment.id}>
                        <p><strong>{comment.written_by}</strong>: {comment.content}</p>
                        <p>{new Date(comment.posted_on).toLocaleString("en-IN")}</p>
                        {editingCommentId === comment.id ? (
                            <>
                                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                                <button onClick={() => handleUpdateComment(comment.id, editText)}>Save</button>
                                <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                            </>
                        ) : (
                            <p>{comment.content}</p>
                        )}
                        {currentUsername === comment.written_by && (
                            <>
                                <button onClick={() => handleEditComment(comment)}>Edit</button>
                                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>


        </div>
    )
}

export default Discuss
