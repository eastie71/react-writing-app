import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowing() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [following, setFollowing] = useState([])

    useEffect(() => {
        // Establish a cancel handle to pass to get request
        const getRequest = Axios.CancelToken.source()
        async function fetchFollowing() {
            try {
                const response = await Axios.get(`profile/${username}/following`, { cancelToken: getRequest.token })
                setIsLoading(false)
                setFollowing(response.data)
            } catch (error) {
                console.log("There was a problem fetching following users or user cancelled.")
            }
        }
        fetchFollowing()
        return () => {
            getRequest.cancel()
        }
    }, [username])

    if (isLoading) {
        return <LoadingDotsIcon />
    }

    return (
        <div className="list-group">
            {following.map((follow, index) => {
                return (
                    <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={follow.avatar} /> {follow.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowing
