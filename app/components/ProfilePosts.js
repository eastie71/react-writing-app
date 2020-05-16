import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"

function ProfilePosts() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPosts] = useState([])
    const appState = useContext(StateContext)

    useEffect(() => {
        // Establish a cancel handle to pass to get request
        const getRequest = Axios.CancelToken.source()
        async function fetchPosts() {
            try {
                const response = await Axios.get(`profile/${username}/posts`, { cancelToken: getRequest.token })
                setIsLoading(false)
                setPosts(response.data)
            } catch (error) {
                console.log("There was a problem fetching posts or user cancelled.")
            }
        }
        fetchPosts()
        return () => {
            getRequest.cancel()
        }
    }, [username])

    if (isLoading) {
        return <LoadingDotsIcon />
    }

    return (
        <>
            {/* Users posts - regardless if logged in or not */}
            {Boolean(posts.length) && (
                <div className="list-group">
                    {posts.map(post => {
                        const postDate = new Date(post.createdDate)
                        const postDateFormatted = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`
                        return (
                            <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
                                <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> <span className="text-muted small">on {postDateFormatted} </span>
                            </Link>
                        )
                    })}
                </div>
            )}
            {/* No posts for current user - encourage them to post! */}
            {!Boolean(posts.length) && appState.user.username == username && (
                <div className="text-center">
                    <p>
                        <strong>You currently have no posts. Why not create your first post?</strong>
                    </p>
                    <p>
                        <Link className="btn btn-sm btn-success mr-2" to="/create-post">
                            Create First Post
                        </Link>
                    </p>
                </div>
            )}
            {/* No posts and not logged in user */}
            {!Boolean(posts.length) && appState.user.username != username && (
                <div className="text-center">
                    <p>
                        <strong>{username}</strong> currently has no posts.
                    </p>
                </div>
            )}
        </>
    )
}

export default ProfilePosts
