import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut() {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const appDispatch = useContext(DispatchContext)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            // With ES6 JS if the property name is the same as the variable name - you can just pass the variable name. ie. username, password
            const response = await Axios.post("/login", { username, password })
            if (response.data) {
                localStorage.setItem("writingAppToken", response.data.token)
                localStorage.setItem("writingAppUsername", response.data.username)
                localStorage.setItem("writingAppAvatar", response.data.avatar)
                appDispatch({ type: "login" })
            } else {
                console.log("Wrong username / password")
            }
        } catch (error) {
            console.log("An error occurred on User Login")
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
