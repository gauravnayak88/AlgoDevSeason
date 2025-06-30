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
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Discussion</h2>
            <div className="bg-white shadow rounded-lg p-4 border mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">{discussion.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                    <strong>By:</strong> {discussion.written_by} •{" "}
                    <strong>Posted on:</strong> {formattedDate}
                </p>
                <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>

                {isOwner && (
                    <div className="flex gap-3 mt-4">
                        <Link to={`/discuss/${id}/edit`}>
                            <button className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Comments</h3>

                {currentUsername && (
                    <form onSubmit={handleAddComment} className="space-y-2 mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                            required
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add Comment
                        </button>
                    </form>
                )}

                <ul className="space-y-4">
                    {comments?.map((comment) => (
                        <li
                            key={comment.id}
                            className="bg-gray-50 border rounded p-3 shadow-sm"
                        >
                            <div className="text-sm text-gray-600 mb-1">
                                <strong>{comment.written_by}</strong> •{" "}
                                {new Date(comment.posted_on).toLocaleString("en-IN")}
                            </div>

                            {editingCommentId === comment.id ? (
                                <>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full border rounded px-2 py-1 mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateComment(comment.id, editText)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingCommentId(null)}
                                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-800 mb-2">{comment.content}</p>
                            )}

                            {currentUsername === comment.written_by && editingCommentId !== comment.id && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditComment(comment)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Discuss
