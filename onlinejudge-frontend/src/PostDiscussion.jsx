import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";


function PostDiscussion () {

    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)

    const navigate = useNavigate()

    const handleSubmit=(e)=> {
        e.preventDefault()
        console.log(title, content)

        API.post(`/api/discussions/`, {'title':title, 'content':content})
        .then((res)=> {
            navigate('/discuss')
        })
        .catch((err)=>{console.log(err)})
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title: </label><br/>
                <input type="text" id="title" name="title" onChange={(e)=>{setTitle(e.target.value)}}/>
                <br/>
                <label htmlFor="title">Content: </label><br/>
                <textarea rows={10} cols={60} type="text" id="title" name="title" onChange={(e)=>{setContent(e.target.value)}}/>
                <br/>
                <button>Post</button>
            </form>
        </div>
    )
}

export default PostDiscussion;