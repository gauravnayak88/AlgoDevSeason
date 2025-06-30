import { useEffect, useState } from "react"
import API from "./api"
import { useParams, useNavigate } from "react-router-dom"

function EditDiscussion() {
    const { id } = useParams()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        API.get(`/api/discuss/${id}`)
            .then(res => {
                setTitle(res.data.title)
                setContent(res.data.content)
            })
            .catch(err => console.log(err))
    }, [id])

    const handleSubmit = (e) => {
        e.preventDefault()
        API.put(`/api/discussions/${id}/`, { title, content })
            .then(() => navigate(`/discuss/${id}`))
            .catch(err => console.log("Update failed", err))
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Discussion</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                        required
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <textarea
                        rows={10}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Content"
                        required
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditDiscussion
