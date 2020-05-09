import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import { withRouter } from "react-router-dom"
import DispatchContext from "../DispatchContext"

function CreatePost(props) {
    const [title, setTitle] = useState()
    const [body, setBody] = useState()
    const appDispatch = useContext(DispatchContext)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            console.log(localStorage.getItem("writingAppToken"))
            const response = await Axios.post("/create-post", { title, body, token: localStorage.getItem("writingAppToken") })
            console.log(response.data)
            appDispatch({ type: "addFlashMessage", value: "Successfully created post!" })
            // Redirect to NEW post URL
            // Note: props.history is provided by react-router-dom (withRouter)
            props.history.push(`/post/${response.data}`)
        } catch (error) {
            console.log("An error occurred on Post Create")
        }
    }

    return (
        <Page title="Create Post">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                        <small>Title</small>
                    </label>
                    <input autoFocus onChange={e => setTitle(e.target.value)} name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
                </div>

                <div className="form-group">
                    <label htmlFor="post-body" className="text-muted mb-1 d-block">
                        <small>Body Content</small>
                    </label>
                    <textarea onChange={e => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
                </div>

                <button className="btn btn-primary">Save New Post</button>
            </form>
        </Page>
    )
}

// withRouter will pass browser history and info into CreatePost component
export default withRouter(CreatePost)
