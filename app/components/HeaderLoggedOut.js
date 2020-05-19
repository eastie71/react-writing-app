import React, { useContext } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from "use-immer"

function HeaderLoggedOut() {
    const appDispatch = useContext(DispatchContext)

    const originalState = {
        username: {
            value: "",
            hasError: false
        },
        password: {
            value: "",
            hasError: false
        }
    }

    function loginReducer(draft, action) {
        switch (action.type) {
            case "usernameCheck":
                draft.username.hasError = false
                draft.username.value = action.value
                if (!draft.username.value && draft.password.value) {
                    draft.username.hasError = true
                } else if (draft.username.value && !draft.password.value) {
                    draft.password.hasError = true
                }
                return
            case "passwordCheck":
                draft.password.hasError = false
                draft.password.value = action.value
                if (!draft.password.value && draft.username.value) {
                    draft.password.hasError = true
                } else if (draft.password.value && !draft.username.value) {
                    draft.username.hasError = true
                }
                return
            case "setErrors":
                if (!draft.username.value) {
                    draft.username.hasError = true
                }
                if (!draft.password.value) {
                    draft.password.hasError = true
                }
                return
        }
    }
    const [state, dispatch] = useImmerReducer(loginReducer, originalState)

    async function handleSubmit(e) {
        e.preventDefault()
        if (state.username.value && state.password.value) {
            // Establish a cancel handle to pass to post request
            const postRequest = Axios.CancelToken.source()
            try {
                // With ES6 JS if the property name is the same as the variable name - you can just pass the variable name. ie. username, password
                const response = await Axios.post("/login", { username: state.username.value, password: state.password.value }, { cancelToken: postRequest.token })
                if (response.data) {
                    // Saved to localStorage with useEffect (see Main.js)
                    appDispatch({ type: "login", userdata: response.data })
                    appDispatch({ type: "addFlashMessage", value: "You have successfully logged in.", messageType: "info" })
                } else {
                    console.log("Wrong username / password")
                    appDispatch({ type: "addFlashMessage", value: "Invalid username / password", messageType: "error" })
                }
            } catch (error) {
                console.log("An error occurred on User Login or User cancelled")
            }
            return () => {
                postRequest.cancel()
            }
        } else {
            dispatch({ type: "setErrors" })
            appDispatch({ type: "addFlashMessage", value: "Please enter a valid username and password to login.", messageType: "warn" })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
            <div className="row align-items-center">
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e => dispatch({ type: "usernameCheck", value: e.target.value })} name="username" className={"form-control form-control-sm input-dark " + (state.username.hasError ? "is-invalid" : "")} type="text" placeholder="Username" autoComplete="off" />
                </div>
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e => dispatch({ type: "passwordCheck", value: e.target.value })} name="password" className={"form-control form-control-sm input-dark " + (state.password.hasError ? "is-invalid" : "")} type="password" placeholder="Password" />
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-success btn-sm">Sign In</button>
                </div>
            </div>
        </form>
    )
}

export default HeaderLoggedOut
