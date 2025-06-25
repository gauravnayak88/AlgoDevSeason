
function PostDiscussion () {

    const handleSubmit=(e)=> {
        e.preventDefault()
        console.log("Submitted")
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title: </label><br></br>
                <input type="text" id="title" name="title"></input><br></br>
                <label htmlFor="title">Content: </label><br></br>
                <textarea type="text" id="title" name="title"></textarea><br></br>
                <button>Post</button>
            </form>
        </div>
    )
}

export default PostDiscussion;