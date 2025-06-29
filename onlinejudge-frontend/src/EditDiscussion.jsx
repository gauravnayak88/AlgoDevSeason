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
        <div>
            <h2>Edit Discussion</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                /><br />
                <textarea
                    rows={10} 
                    cols={60}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Content"
                    required
                ></textarea><br />
                <button type="submit">Save</button>
            </form>
        </div>
    )
}

export default EditDiscussion
