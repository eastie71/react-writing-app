import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowers() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [followers, setFollowers] = useState([])

    useEffect(() => {
        // Establish a cancel handle to pass to get request
        const getRequest = Axios.CancelToken.source()
        async function fetchFollowers() {
            try {
                const response = await Axios.get(`profile/${username}/followers`, { cancelToken: getRequest.token })
                setIsLoading(false)
                setFollowers(response.data)
            } catch (error) {
                console.log("There was a problem fetching followers or user cancelled.")
            }
        }
        fetchFollowers()
        return () => {
            getRequest.cancel()
        }
    }, [username])

    if (isLoading) {
        return <LoadingDotsIcon />
    }

    return (
        <div className="list-group">
            {followers.map((follower, index) => {
                return (
                    <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowers
