import React, { useEffect, useState, useContext } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import Axios from "axios"
import { useParams, Link, withRouter } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost(props) {
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const originalState = {
        title: {
            value: "",
            hasErrors: false,
            errorMessage: ""
        },
        body: {
            value: "",
            hasErrors: false,
            errorMessage: ""
        },
        isLoading: true,
        isSaving: false,
        id: useParams().id,
        sendRequestCount: 0,
        postNotFound: false
    }

    function editReducer(draft, action) {
        switch (action.type) {
            case "loadCompleted":
                draft.title.value = action.value.title
                draft.body.value = action.value.body
                draft.isLoading = false
                return
            case "titleValidate":
                if (action.value.trim() == "") {
                    draft.title.hasErrors = true
                    draft.title.errorMessage = "Title cannot be empty"
                } else {
                    draft.title.hasErrors = false
                    draft.title.errorMessage = ""
                }
                return
            case "titleChange":
                if (action.value) {
                    draft.title.hasErrors = false
                    draft.title.errorMessage = ""
                }
                draft.title.value = action.value
                return
            case "bodyValidate":
                if (action.value.trim() == "") {
                    draft.body.hasErrors = true
                    draft.body.errorMessage = "Content cannot be empty"
                } else {
                    draft.body.hasErrors = false
                    draft.body.errorMessage = ""
                }
                return
            case "bodyChange":
                if (action.value) {
                    draft.body.hasErrors = false
                    draft.body.errorMessage = ""
                }
                draft.body.value = action.value
                return
            case "submitUpdatePost":
                if (!draft.title.hasErrors && !draft.body.hasErrors) {
                    draft.sendRequestCount++
                }
                return
            case "startSaving":
                draft.isSaving = true
                return
            case "finishSaving":
                draft.isSaving = false
                return
            case "postNotFound":
                draft.postNotFound = true
                return
        }
    }
    const [state, dispatch] = useImmerReducer(editReducer, originalState)

    useEffect(() => {
        // Establish a cancel handle to pass to get request - say if user navigates away quickly before get request completes
        const getRequest = Axios.CancelToken.source()

        async function loadPost() {
            try {
                const response = await Axios.get(`post/${state.id}`, { cancelToken: getRequest.token })
                if (response.data) {
                    dispatch({ type: "loadCompleted", value: response.data })
                    // Only the author of the post can edit the post
                    if (appState.user.username != response.data.author.username) {
                        appDispatch({ type: "addFlashMessage", value: "You do not have permission to edit that post", messageType: "error" })
                        // Redirect user back to homepage (needed to include "withRouter" to perform this action)
                        props.history.push("/")
                    }
                } else {
                    dispatch({ type: "postNotFound" })
                }
            } catch (error) {
                console.log("There was a problem trying to load a post or user cancelled")
            }
        }
        loadPost()
        return () => {
            // This is the cleanup function so - call cancel (via the handle) to cancel the axios get request
            getRequest.cancel()
        }
    }, [])

    useEffect(() => {
        if (state.sendRequestCount) {
            dispatch({ type: "startSaving" })

            // Establish a cancel handle to pass to post request - say if user navigates away quickly before post request completes
            const postRequest = Axios.CancelToken.source()

            async function loadPost() {
                try {
                    const response = await Axios.post(`post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: postRequest.token })
                    dispatch({ type: "finishSaving" })
                    appDispatch({ type: "addFlashMessage", value: "Post Updated Successfully." })
                } catch (error) {
                    console.log("There was a problem trying to update a post or user cancelled")
                }
            }
            loadPost()
            return () => {
                // This is the cleanup function so - call cancel (via the handle) to cancel the axios post request
                postRequest.cancel()
            }
        }
    }, [state.sendRequestCount])

    function submitHandler(e) {
        e.preventDefault()
        dispatch({ type: "titleValidate", value: state.title.value })
        dispatch({ type: "bodyValidate", value: state.body.value })
        dispatch({ type: "submitUpdatePost" })
    }

    if (state.postNotFound) {
        return <NotFound />
    }

    if (state.isLoading) {
        return (
            <Page title="...">
                <LoadingDotsIcon />
            </Page>
        )
    }

    return (
        <Page title="Edit Post">
            <Link className="small font-weight-bold" to={`/post/${state.id}`}>
                &laquo; Return to View Post
            </Link>
            <form className="mt-3" onSubmit={submitHandler}>
                <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                        <small>Title</small>
                    </label>
                    <input onBlur={e => dispatch({ type: "titleValidate", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
                    {state.title.hasErrors ? <div className="alert alert-danger small liveValidateMessage">{state.title.errorMessage}</div> : <div></div>}
                </div>

                <div className="form-group">
                    <label htmlFor="post-body" className="text-muted mb-1 d-block">
                        <small>Body Content</small>
                    </label>
                    <textarea onBlur={e => dispatch({ type: "bodyValidate", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />
                    {state.body.hasErrors ? <div className="alert alert-danger small liveValidateMessage">{state.body.errorMessage}</div> : <div></div>}
                </div>

                <button className="btn btn-primary" disabled={state.isSaving}>
                    {state.isSaving ? "Saving Post.." : "Update Post"}
                </button>
            </form>
        </Page>
    )
}

export default withRouter(EditPost)
