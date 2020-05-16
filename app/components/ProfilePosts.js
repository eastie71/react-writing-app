import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfilePosts() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPosts] = useState([])

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
    )
}

export default ProfilePosts
