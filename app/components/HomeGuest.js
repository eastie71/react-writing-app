import React, { useState, useEffect, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
    const appDispatch = useContext(DispatchContext)
    const originalState = {
        username: {
            value: "",
            hasErrors: false,
            errorMessage: "",
            isUnique: false,
            checkCount: 0
        },
        email: {
            value: "",
            hasErrors: false,
            errorMessage: "",
            isUnique: false,
            checkCount: 0
        },
        password: {
            value: "",
            hasErrors: false,
            errorMessage: ""
        },
        submitCount: 0
    }

    function registerReducer(draft, action) {
        switch (action.type) {
            case "usernameCheckImmediately":
                draft.username.hasErrors = false
                draft.username.value = action.value
                if (draft.username.value.length > 30) {
                    draft.username.hasErrors = true
                    draft.username.errorMessage = "Username cannot exceed 30 characters."
                }
                if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
                    draft.username.hasErrors = true
                    draft.username.errorMessage = "Username can only contain letters and numbers."
                }
                return
            case "usernameCheckAfterDelay":
                if (draft.username.value.length < 3) {
                    draft.username.hasErrors = true
                    draft.username.errorMessage = "Username must be at least 3 characters long."
                }
                if (!draft.username.hasErrors && !action.noRequest) {
                    draft.username.checkCount++
                }
                return
            case "usernameCheckUnique":
                if (action.value) {
                    draft.username.hasErrors = true
                    draft.username.isUnique = false
                    draft.username.errorMessage = "Sorry, that username is already taken."
                } else {
                    draft.username.isUnique = true
                }
                return
            case "emailCheckImmediately":
                draft.email.hasErrors = false
                draft.email.value = action.value
                return
            case "emailCheckAfterDelay":
                if (!/^\S+@\S+$/.test(draft.email.value)) {
                    draft.email.hasErrors = true
                    draft.email.errorMessage = "Please enter a valid email address."
                }
                if (!draft.email.hasErrors && !action.noRequest) {
                    draft.email.checkCount++
                }
                return
            case "emailCheckUnique":
                if (action.value) {
                    draft.email.hasErrors = true
                    draft.email.isUnique = false
                    draft.email.errorMessage = "Sorry, that email is already taken."
                } else {
                    draft.email.isUnique = true
                }
                return
            case "passwordCheckImmediately":
                draft.password.hasErrors = false
                draft.password.value = action.value
                if (draft.password.value.length > 50) {
                    draft.password.hasErrors = true
                    draft.password.errorMessage = "Password cannot exceed 50 characters."
                }
                return
            case "passwordCheckAfterDelay":
                if (draft.password.value.length < 12) {
                    draft.password.hasErrors = true
                    draft.password.errorMessage = "Password must be at least 12 characters long."
                }
                return
            case "submitForm":
                if (!draft.username.hasErrors && !draft.email.hasErrors && draft.username.isUnique && draft.email.isUnique && !draft.password.hasErrors) {
                    draft.submitCount++
                }
                return
        }
    }
    const [state, dispatch] = useImmerReducer(registerReducer, originalState)

    // Whenever username value changes - validate Username after a short delay
    useEffect(() => {
        if (state.username.value) {
            const delay = setTimeout(() => dispatch({ type: "usernameCheckAfterDelay" }), 800)
            return () => clearTimeout(delay)
        }
    }, [state.username.value])

    // Whenever username checkCount changes (and hence there are no current validation errors) - check the Username for uniqueness
    useEffect(() => {
        if (state.username.checkCount) {
            const checkUsernameRequest = Axios.CancelToken.source()
            async function checkUsernameResults() {
                try {
                    const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: checkUsernameRequest.token })
                    dispatch({ type: "usernameCheckUnique", value: response.data })
                } catch (error) {
                    console.log("A problem occurred while checking username is unique or the user cancelled.")
                }
            }
            checkUsernameResults()
            return () => checkUsernameRequest.cancel()
        }
    }, [state.username.checkCount])

    // Whenever email value changes - validate Email after a short delay
    useEffect(() => {
        if (state.email.value) {
            const delay = setTimeout(() => dispatch({ type: "emailCheckAfterDelay" }), 800)
            return () => clearTimeout(delay)
        }
    }, [state.email.value])

    // Whenever email checkCount changes (and hence there are no current validation errors) - check the Email for uniqueness
    useEffect(() => {
        if (state.email.checkCount) {
            const checkEmailRequest = Axios.CancelToken.source()
            async function checkEmailResults() {
                try {
                    const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: checkEmailRequest.token })
                    dispatch({ type: "emailCheckUnique", value: response.data })
                } catch (error) {
                    console.log("A problem occurred while checking email is unique or the user cancelled.")
                }
            }
            checkEmailResults()
            return () => checkEmailRequest.cancel()
        }
    }, [state.email.checkCount])

    // Whenever password value changes - validate Password after a short delay
    useEffect(() => {
        if (state.password.value) {
            const delay = setTimeout(() => dispatch({ type: "passwordCheckAfterDelay" }), 800)
            return () => clearTimeout(delay)
        }
    }, [state.password.value])

    // If registration fields have no errors then perform registration call
    useEffect(() => {
        if (state.submitCount) {
            const registerRequest = Axios.CancelToken.source()
            async function registerSubmitRequest() {
                try {
                    console.log("Register submit")
                    const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: registerRequest.token })
                    console.log("After register submit")
                    console.log(response.data)
                    appDispatch({ type: "login", userdata: response.data })
                    appDispatch({ type: "addFlashMessage", value: "Congratulations, You have successfully registered." })
                } catch (error) {
                    console.log("A problem occurred with registration or the user cancelled.")
                }
            }
            registerSubmitRequest()
            return () => registerRequest.cancel()
        }
    }, [state.submitCount])

    function handleSubmit(e) {
        e.preventDefault()
        dispatch({ type: "usernameCheckImmediately", value: state.username.value })
        dispatch({ type: "usernameCheckAfterDelay", value: state.username.value, noRequest: true })
        dispatch({ type: "emailCheckImmediately", value: state.email.value })
        dispatch({ type: "emailCheckAfterDelay", value: state.email.value, noRequest: true })
        dispatch({ type: "passwordCheckImmediately", value: state.password.value })
        dispatch({ type: "passwordCheckAfterDelay", value: state.password.value })
        dispatch({ type: "submitForm" })
    }
    return (
        <Page title="Welcome">
            <div className="row align-items-center">
                <div className="col-lg-7 py-3 py-md-5">
                    <h1 className="display-3">Remember Writing?</h1>
                    <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
                </div>
                <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username-register" className="text-muted mb-1">
                                <small>Username</small>
                            </label>
                            <input onChange={e => dispatch({ type: "usernameCheckImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
                            <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                <div className="alert alert-danger small liveValidateMessage">{state.username.errorMessage}</div>
                            </CSSTransition>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email-register" className="text-muted mb-1">
                                <small>Email</small>
                            </label>
                            <input onChange={e => dispatch({ type: "emailCheckImmediately", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
                            <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                <div className="alert alert-danger small liveValidateMessage">{state.email.errorMessage}</div>
                            </CSSTransition>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password-register" className="text-muted mb-1">
                                <small>Password</small>
                            </label>
                            <input onChange={e => dispatch({ type: "passwordCheckImmediately", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
                            <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                <div className="alert alert-danger small liveValidateMessage">{state.password.errorMessage}</div>
                            </CSSTransition>
                        </div>
                        <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
                            Sign up for ComplexApp
                        </button>
                    </form>
                </div>
            </div>
        </Page>
    )
}

export default HomeGuest
