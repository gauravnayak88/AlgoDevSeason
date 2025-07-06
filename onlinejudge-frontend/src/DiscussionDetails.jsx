// import { useEffect, useState } from "react"
// import API from "./api"
// import { useParams, useNavigate, Link } from "react-router-dom"

// function Discuss() {
//     const { id } = useParams()
//     const [discussion, setDiscussion] = useState(null)
//     const [comments, setComments] = useState(null)
//     const [newComment, setNewComment] = useState("")
//     const [editingCommentId, setEditingCommentId] = useState(null);
//     const [editText, setEditText] = useState("");

//     const [currentUsername, setCurrentUsername] = useState(null)
//     const navigate = useNavigate()

//     useEffect(() => {
//         API.get(`/api/discuss/${id}`)
//             .then(res => { setDiscussion(res.data) })
//             .catch(err => {
//                 console.log(err)
//                 console.log("Error")
//             })

//         // Get current user's username
//         API.get('/api/profile/')
//             .then(res => setCurrentUsername(res.data.username))
//             .catch(err => console.log(err))
//     }, [id])

//     useEffect(() => {
//         API.get(`/api/discussions/${id}/comments`)
//             .then(res => { setComments(res.data) })
//             .catch(err => { console.log(err) })
//     }, [])

//     const handleDelete = () => {
//         const confirm = window.confirm("Are you sure you want to delete this discussion?");
//         if (!confirm) return;

//         API.delete(`/api/discussions/${id}/`)
//             .then(() => navigate("/discuss"))  // Redirect to list after deletion
//             .catch(err => console.log("Delete failed", err))
//     }

//     const handleAddComment = (e) => {
//         e.preventDefault();
//         if (!newComment.trim()) return;

//         API.post('/api/comments/', {
//             discussion: id,
//             content: newComment,
//         })
//             .then(res => {
//                 setComments(prev => [res.data, ...prev]);
//                 setNewComment("");
//             })
//             .catch(err => console.log(err));
//     }

//     const handleUpdateComment = (commentId, updatedText) => {
//         API.patch(`/api/comments/${commentId}/`, {
//             content: updatedText,
//         })
//             .then(res => {
//                 setComments(prev => prev.map(c => c.id === commentId ? res.data : c));
//                 setEditText("")
//                 setEditingCommentId(null)
//             })
//             .catch(err => console.log(err));
//     };

//     function handleEditComment(comment) {
//         setEditingCommentId(comment.id);
//         setEditText(comment.content);
//     }

//     const handleDeleteComment = (commentId) => {
//         if (!window.confirm("Delete comment?")) return;

//         API.delete(`/api/comments/${commentId}/`)
//             .then(() => {
//                 setComments(prev => prev.filter(c => c.id !== commentId));
//             })
//             .catch(err => console.log(err));
//     };

//     const options = {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//     };

//     if (!discussion) return <p>Loading...</p>

//     const formattedDate = new Date(discussion.posted_on).toLocaleString("en-IN", options)

//     const isOwner = discussion.written_by === currentUsername

//     return (
//         <div className="p-6 max-w-4xl mx-auto">
//             <h2 className="text-3xl font-bold text-gray-800 mb-2">Discussion</h2>
//             <div className="bg-white shadow rounded-lg p-4 border mb-6">
//                 <h3 className="text-2xl font-semibold text-gray-800">{discussion.title}</h3>
//                 <p className="text-sm text-gray-600 mb-2">
//                     <strong>By:</strong> {discussion.written_by} •{" "}
//                     <strong>Posted on:</strong> {formattedDate}
//                 </p>
//                 <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>

//                 {isOwner && (
//                     <div className="flex gap-3 mt-4">
//                         <Link to={`/discuss/${id}/edit`}>
//                             <button className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
//                                 Edit
//                             </button>
//                         </Link>
//                         <button
//                             onClick={handleDelete}
//                             className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 )}
//             </div>

//             <div className="mb-6">
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">Comments</h3>

//                 {currentUsername && (
//                     <form onSubmit={handleAddComment} className="space-y-2 mb-6">
//                         <textarea
//                             value={newComment}
//                             onChange={(e) => setNewComment(e.target.value)}
//                             placeholder="Write a comment..."
//                             className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
//                             required
//                         />
//                         <button
//                             type="submit"
//                             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                         >
//                             Add Comment
//                         </button>
//                     </form>
//                 )}

//                 <ul className="space-y-4">
//                     {comments?.map((comment) => (
//                         <li
//                             key={comment.id}
//                             className="bg-gray-50 border rounded p-3 shadow-sm"
//                         >
//                             <div className="text-sm text-gray-600 mb-1">
//                                 <strong>{comment.written_by}</strong> •{" "}
//                                 {new Date(comment.posted_on).toLocaleString("en-IN")}
//                             </div>

//                             {editingCommentId === comment.id ? (
//                                 <>
//                                     <textarea
//                                         value={editText}
//                                         onChange={(e) => setEditText(e.target.value)}
//                                         className="w-full border rounded px-2 py-1 mb-2"
//                                     />
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => handleUpdateComment(comment.id, editText)}
//                                             className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
//                                         >
//                                             Save
//                                         </button>
//                                         <button
//                                             onClick={() => setEditingCommentId(null)}
//                                             className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
//                                         >
//                                             Cancel
//                                         </button>
//                                     </div>
//                                 </>
//                             ) : (
//                                 <p className="text-gray-800 mb-2">{comment.content}</p>
//                             )}

//                             {currentUsername === comment.written_by && editingCommentId !== comment.id && (
//                                 <div className="flex gap-2">
//                                     <button
//                                         onClick={() => handleEditComment(comment)}
//                                         className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
//                                     >
//                                         Edit
//                                     </button>
//                                     <button
//                                         onClick={() => handleDeleteComment(comment.id)}
//                                         className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//                                     >
//                                         Delete
//                                     </button>
//                                 </div>
//                             )}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     )
// }

// export default Discuss

import { useEffect, useState } from "react"
import API from "./api"
import { useParams, useNavigate, Link } from "react-router-dom"

// Helper for avatar fallback
const Avatar = ({ name }) => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-300 to-blue-300 flex items-center justify-center text-lg font-bold text-white shadow">
        {name ? name[0].toUpperCase() : "?"}
    </div>
);

function Discuss() {
    const { id } = useParams();
    const [discussion, setDiscussion] = useState(null);
    const [comments, setComments] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");
    const [currentUsername, setCurrentUsername] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get(`/api/discuss/${id}`)
            .then(res => setDiscussion(res.data))
            .catch(err => {
                console.log(err)
                console.log("Error")
            });

        // Get current user's username
        API.get('/api/profile/')
            .then(res => setCurrentUsername(res.data.username))
            .catch(err => console.log(err));
    }, [id]);

    useEffect(() => {
        API.get(`/api/discussions/${id}/comments`)
            .then(res => { setComments(res.data) })
            .catch(err => { console.log(err) })
    }, [id]);

    const handleDelete = () => {
        const confirm = window.confirm("Are you sure you want to delete this discussion?");
        if (!confirm) return;

        API.delete(`/api/discussions/${id}/`)
            .then(() => navigate("/discuss"))
            .catch(err => console.log("Delete failed", err));
    };

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
    };

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

    if (!discussion)
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <span className="ml-4 text-lg text-gray-600">Loading discussion...</span>
            </div>
        );

    const formattedDate = new Date(discussion.posted_on).toLocaleString("en-IN", options);
    const isOwner = discussion.written_by === currentUsername;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-indigo-800 mb-4 drop-shadow">Discussion</h2>
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-indigo-100 mb-8 flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col items-center gap-2 min-w-[70px]">
                    <Avatar name={discussion.written_by} />
                    <span className="text-xs text-gray-500">{discussion.written_by}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-indigo-900">{discussion.title}</h3>
                        <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                            {formattedDate}
                        </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line mt-2">{discussion.content}</p>
                    {isOwner && (
                        <div className="flex gap-3 mt-4">
                            <Link to={`/discuss/${id}/edit`}>
                                <button className="px-4 py-1 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition">
                                    Edit
                                </button>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">Comments</h3>

                {currentUsername && (
                    <form onSubmit={handleAddComment} className="flex flex-col gap-2 mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 shadow"
                            required
                        />
                        <button
                            type="submit"
                            className="self-end px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold"
                        >
                            Add Comment
                        </button>
                    </form>
                )}

                {!comments ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <span className="ml-4 text-lg text-gray-600">Loading comments...</span>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</div>
                ) : (
                    <ul className="space-y-5">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex gap-3"
                            >
                                <Avatar name={comment.written_by} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-800">{comment.written_by}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(comment.posted_on).toLocaleString("en-IN")}
                                        </span>
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
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Discuss;
