import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import { useParams, Link, withRouter } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
import ReactToolTip from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(props) {
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState([])

    useEffect(
        () => {
            // Establish a cancel handle to pass to get request - say if user navigates away quickly before get request completes
            const getRequest = Axios.CancelToken.source()

            async function fetchPost() {
                try {
                    const response = await Axios.get(`post/${id}`, { cancelToken: getRequest.token })
                    setPost(response.data)
                    setIsLoading(false)
                } catch (error) {
                    console.log("There was a problem trying to load a post or user cancelled")
                }
            }
            fetchPost()
            return () => {
                // This is the cleanup function so - call cancel (via the handle) to cancel the axios get request
                getRequest.cancel()
            }
        },
        /* Need dependency of "id" - eg. if searching for a post and the post "id" is different to current - run this code to retrieve the post */ [id]
    )

    if (!isLoading && !post) {
        return <NotFound />
    }

    if (isLoading) {
        return (
            <Page title="...">
                <LoadingDotsIcon />
            </Page>
        )
    }

    const postDate = new Date(post.createdDate)
    const postDateFormatted = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`

    function isOwner() {
        if (appState.loggedIn) {
            return appState.user.username == post.author.username
        }
        return false
    }

    async function deleleteHandler() {
        const confirmation = window.confirm("Please confirm you really want to delete this post? It cannot be restored once deleted")
        if (confirmation) {
            try {
                // No need to handle a cancel or user moving away from page on confirming delete - as nothing modified on the page
                // and still ok to re-direct to profile page anyway
                const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
                if (response.data == "Success") {
                    appDispatch({ type: "addFlashMessage", value: "Post successfully deleted.", messageType: "info" })
                    props.history.push(`/profile/${appState.user.username}`)
                } else {
                    appDispatch({ type: "addFlashMessage", value: "An error occurred trying to delete the post", messageType: "error" })
                }
            } catch (error) {
                console.log("There was a problem trying to delete the post.")
            }
        }
    }

    return (
        <Page title={post.title}>
            <div className="d-flex justify-content-between">
                <h2>{post.title}</h2>
                {isOwner() ? (
                    <span className="pt-2">
                        <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
                            <i className="fas fa-edit"></i>
                        </Link>
                        <ReactToolTip id="edit" className="custom-tooltip" />
                        {"      "}
                        <a onClick={deleleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
                            <i className="fas fa-trash"></i>
                        </a>
                        <ReactToolTip id="delete" className="custom-tooltip" />
                    </span>
                ) : (
                    <></>
                )}
            </div>

            <p className="text-muted small mb-4">
                <Link to={`/profile/${post.author.username}`}>
                    <img className="avatar-tiny" src={post.author.avatar} />
                </Link>
                Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {postDateFormatted}
            </p>

            <div className="body-content">
                <ReactMarkdown source={post.body} allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]} />
            </div>
        </Page>
    )
}

export default withRouter(ViewSinglePost)
