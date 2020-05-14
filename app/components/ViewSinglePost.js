import React, { useEffect, useState } from "react"
import Page from "./Page"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ViewSinglePost() {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState([])

    useEffect(() => {
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
    }, [])

    if (isLoading) {
        return (
            <Page title="...">
                <LoadingDotsIcon />
            </Page>
        )
    }

    const postDate = new Date(post.createdDate)
    const postDateFormatted = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`
    return (
        <Page title={post.title}>
            <div className="d-flex justify-content-between">
                <h2>{post.title}</h2>
                <span className="pt-2">
                    <a href="#" className="text-primary mr-2" title="Edit">
                        <i className="fas fa-edit"></i>
                    </a>
                    <a className="delete-post-button text-danger" title="Delete">
                        <i className="fas fa-trash"></i>
                    </a>
                </span>
            </div>

            <p className="text-muted small mb-4">
                <Link to={`/profile/${post.author.username}`}>
                    <img className="avatar-tiny" src={post.author.avatar} />
                </Link>
                Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {postDateFormatted}
            </p>

            <div className="body-content">{post.body}</div>
        </Page>
    )
}

export default ViewSinglePost
