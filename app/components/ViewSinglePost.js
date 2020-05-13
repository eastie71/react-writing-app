import React, { useEffect, useState } from "react"
import Page from "./Page"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"

function ViewSinglePost() {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState([])

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await Axios.get(`post/${id}`)
                setPost(response.data)
                setIsLoading(false)
            } catch (error) {
                console.log("There was a problem trying to load a post")
            }
        }
        fetchPost()
    }, [])

    if (isLoading) {
        return (
            <Page title="...">
                <div>Loading...</div>
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
