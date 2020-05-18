import React, { useEffect, useContext } from "react"
import Page from "./Page"
import StateContext from "../StateContext"
import { useImmer } from "use-immer"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Axios from "axios"
import { Link } from "react-router-dom"
import PostLine from "./PostLine"

function Home() {
    const appState = useContext(StateContext)
    const [state, setState] = useImmer({
        isLoading: true,
        feedResults: []
    })

    useEffect(() => {
        // Establish a cancel handle to pass to post request
        const postRequest = Axios.CancelToken.source()

        // useEffect cannot be called with an async function - so need to split code into async function here...
        async function fetchFeedData() {
            try {
                const response = await Axios.post("/getHomeFeed", { token: appState.user.token }, { cancelToken: postRequest.token })
                setState(draft => {
                    draft.isLoading = false
                    draft.feedResults = response.data
                })
            } catch (error) {
                console.log("There was a problem retrieving the user feed data or user cancelled")
            }
        }
        fetchFeedData()
        return () => {
            postRequest.cancel()
        }
    }, [])

    if (state.isLoading) {
        return <LoadingDotsIcon />
    }

    return (
        <Page title="Home">
            {state.feedResults.length > 0 && (
                <>
                    <h2 className="text-center mb-4">Latest From People You Follow</h2>
                    <div className="list-group">
                        {state.feedResults.map(post => {
                            return <PostLine key={post._id} post={post} />
                        })}
                    </div>
                </>
            )}
            {state.feedResults.length == 0 && (
                <>
                    <h2 className="text-center">
                        Hello <strong>{appState.user.username}</strong>, your feed is empty.
                    </h2>
                    <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
                </>
            )}
        </Page>
    )
}

export default Home
