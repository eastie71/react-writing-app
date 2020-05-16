import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ProfileFollowing() {
    const { username } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [following, setFollowing] = useState([])
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)

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
        <>
            {Boolean(following.length) && (
                <div className="list-group">
                    {following.map((follow, index) => {
                        return (
                            <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
                                <img className="avatar-tiny" src={follow.avatar} /> {follow.username}
                            </Link>
                        )
                    })}
                </div>
            )}
            {!Boolean(following.length) && appState.user.username == username && (
                <div className="text-center">
                    <p>
                        <strong>Currently you are not following anyone. Try searching for posts to find somebody to follow.</strong>
                    </p>
                    <p>
                        <button onClick={() => appDispatch({ type: "openSearch" })} className="btn btn-sm btn-primary mr-2">
                            Search Posts
                        </button>
                    </p>
                </div>
            )}
            {!Boolean(following.length) && appState.user.username != username && (
                <div className="text-center">
                    <p>
                        <strong>{username}</strong> is currently not following anyone.
                    </p>
                </div>
            )}
        </>
    )
}

export default ProfileFollowing
