import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";


function PostDiscussion() {

    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(title, content)

        API.post(`/api/discussions/`, { 'title': title, 'content': content })
            .then((res) => {
                navigate('/discuss')
            })
            .catch((err) => { console.log(err) })
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a New Discussion</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={10}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PostDiscussion;