import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useParams } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"

function Profile() {
    // Just get the "username from useParams"
    const { username } = useParams()
    const appState = useContext(StateContext)
    // Setup placeholder values as initial Profile User data - for when data is loading from server
    const [profileData, setProfileData] = useState({
        profileUsername: "...",
        profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
        isFollowing: false,
        counts: { postCount: "", followerCount: "", followingCount: "" }
    })

    // Only run the function the FIRST (and only) time this component is rendered.
    useEffect(() => {
        // Establish a cancel handle to pass to post request
        const postRequest = Axios.CancelToken.source()

        // useEffect cannot be called with an async function - so need to split code into async function here...
        async function fetchProfileData() {
            try {
                const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: postRequest.token })
                setProfileData(response.data)
            } catch (error) {
                console.log("There was a problem retrieving user data or user cancelled")
            }
        }
        fetchProfileData()
        return () => {
            postRequest.cancel()
        }
    }, [])

    return (
        <Page title="Profile Screen - Fix Later">
            <h2>
                <img className="avatar-small" src={profileData.profileAvatar} /> {profileData.profileUsername}
                <button className="btn btn-primary btn-sm ml-2">
                    Follow <i className="fas fa-user-plus"></i>
                </button>
            </h2>

            <div className="profile-nav nav nav-tabs pt-2 mb-4">
                <a href="#" className="active nav-item nav-link">
                    Posts: {profileData.counts.postCount}
                </a>
                <a href="#" className="nav-item nav-link">
                    Followers: {profileData.counts.followerCount}
                </a>
                <a href="#" className="nav-item nav-link">
                    Following: {profileData.counts.followingCount}
                </a>
            </div>

            <ProfilePosts />
        </Page>
    )
}

export default Profile
