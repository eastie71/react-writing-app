import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"

function ProfileFollowers() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [followers, setFollowers] = useState([])
    const appState = useContext(StateContext)

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
        <>
            {Boolean(followers.length) && (
                <div className="list-group">
                    {followers.map((follower, index) => {
                        return (
                            <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                                <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
                            </Link>
                        )
                    })}
                </div>
            )}
            {!Boolean(followers.length) && appState.user.username == username && (
                <div className="text-center">
                    <p>
                        <strong>Currently no-one is following you. Try creating new posts to get some followers.</strong>
                    </p>
                    <p>
                        <Link className="btn btn-sm btn-success mr-2" to="/create-post">
                            Create Post
                        </Link>
                    </p>
                </div>
            )}
            {!Boolean(followers.length) && appState.user.username != username && (
                <div className="text-center">
                    <p>
                        Currently no-one is following <strong>{username}</strong>. {appState.loggedIn ? "Why not be the first person to follow them?" : ""}
                    </p>
                </div>
            )}
        </>
    )
}

export default ProfileFollowers
