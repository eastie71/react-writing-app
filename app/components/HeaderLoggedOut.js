import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut() {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const appDispatch = useContext(DispatchContext)

    async function handleSubmit(e) {
        e.preventDefault()
        // Establish a cancel handle to pass to post request
        const postRequest = Axios.CancelToken.source()
        try {
            // With ES6 JS if the property name is the same as the variable name - you can just pass the variable name. ie. username, password
            const response = await Axios.post("/login", { username, password }, { cancelToken: postRequest.token })
            if (response.data) {
                // Saved to localStorage with useEffect (see Main.js)
                appDispatch({ type: "login", userdata: response.data })
            } else {
                console.log("Wrong username / password")
            }
        } catch (error) {
            console.log("An error occurred on User Login or User cancelled")
        }
        return () => {
            postRequest.cancel()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
            <div className="row align-items-center">
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e => setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
                </div>
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-success btn-sm">Sign In</button>
                </div>
            </div>
        </form>
    )
}

export default HeaderLoggedOut
