import React, { useEffect, useContext } from "react"
import Page from "./Page"
import { useParams, NavLink, Switch, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import { useImmer } from "use-immer"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import NotFound from "./NotFound"

function Profile() {
    // Just get the "username from useParams"
    const { username } = useParams()
    const appState = useContext(StateContext)
    // Setup placeholder values as initial Profile User data - for when data is loading from server
    const [state, setState] = useImmer({
        followActionRunning: false,
        startFollowActionCount: 0,
        stopFollowActionCount: 0,
        profileData: {
            profileUsername: "...",
            profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
            isFollowing: false,
            counts: { postCount: "", followerCount: "", followingCount: "" }
        }
    })

    // User Profile details load handling
    // Only run this function if the profile username changes.
    useEffect(() => {
        // Establish a cancel handle to pass to post request
        const postRequest = Axios.CancelToken.source()

        // useEffect cannot be called with an async function - so need to split code into async function here...
        async function fetchProfileData() {
            try {
                const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: postRequest.token })
                setState(draft => {
                    draft.profileData = response.data
                })
            } catch (error) {
                console.log("There was a problem retrieving user data or user cancelled")
            }
        }
        fetchProfileData()
        return () => {
            postRequest.cancel()
        }
    }, [username])

    // Start Following handling
    useEffect(() => {
        if (state.startFollowActionCount) {
            setState(draft => {
                draft.followActionRunning = true
            })
            // Establish a cancel handle to pass to follow request
            const followRequest = Axios.CancelToken.source()

            // useEffect cannot be called with an async function - so need to split code into async function here...
            async function followRequestCall() {
                try {
                    const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: followRequest.token })
                    setState(draft => {
                        draft.profileData.isFollowing = true
                        draft.profileData.counts.followerCount++
                        draft.followActionRunning = false
                    })
                } catch (error) {
                    console.log("There was a problem following user or user cancelled")
                }
            }
            followRequestCall()
            return () => {
                followRequest.cancel()
            }
        }
    }, [state.startFollowActionCount])

    // Stop Following handling
    useEffect(() => {
        if (state.stopFollowActionCount) {
            setState(draft => {
                draft.followActionRunning = true
            })
            // Establish a cancel handle to pass to follow request
            const unfollowRequest = Axios.CancelToken.source()

            // useEffect cannot be called with an async function - so need to split code into async function here...
            async function unfollowRequestCall() {
                try {
                    const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: unfollowRequest.token })
                    setState(draft => {
                        draft.profileData.isFollowing = false
                        draft.profileData.counts.followerCount--
                        draft.followActionRunning = false
                    })
                } catch (error) {
                    console.log("There was a problem unfollowing user or user cancelled")
                }
            }
            unfollowRequestCall()
            return () => {
                unfollowRequest.cancel()
            }
        }
    }, [state.stopFollowActionCount])

    function startFollowing() {
        setState(draft => {
            draft.startFollowActionCount++
        })
    }

    function stopFollowing() {
        setState(draft => {
            draft.stopFollowActionCount++
        })
    }

    if (!state.profileData) {
        return <NotFound />
    }

    return (
        <Page title={`${username}'s Profile`}>
            <h2>
                <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
                {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
                    <button onClick={startFollowing} disabled={state.followActionRunning} className="btn btn-primary btn-sm ml-2">
                        Follow <i className="fas fa-user-plus"></i>
                    </button>
                )}
                {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
                    <button onClick={stopFollowing} disabled={state.followActionRunning} className="btn btn-danger btn-sm ml-2">
                        UnFollow <i className="fas fa-user-times"></i>
                    </button>
                )}
            </h2>

            <div className="profile-nav nav nav-tabs pt-2 mb-4">
                <NavLink exact to={`/profile/${username}`} className="nav-item nav-link">
                    Posts: {state.profileData.counts.postCount}
                </NavLink>
                <NavLink to={`/profile/${username}/followers`} className="nav-item nav-link">
                    Followers: {state.profileData.counts.followerCount}
                </NavLink>
                <NavLink to={`/profile/${username}/following`} className="nav-item nav-link">
                    Following: {state.profileData.counts.followingCount}
                </NavLink>
            </div>

            <Switch>
                <Route exact path="/profile/:username">
                    <ProfilePosts />
                </Route>
                <Route path="/profile/:username/followers">
                    <ProfileFollowers />
                </Route>
                <Route path="/profile/:username/following">
                    <ProfileFollowing />
                </Route>
            </Switch>
        </Page>
    )
}

export default Profile
