import React, { useState, useReducer } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"

import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// Components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import CreatePost from "./components/CreatePost"
import ViewSinglePost from "./components/ViewSinglePost"
import FlashMessages from "./components/FlashMessages"

function Main() {
    const initialState = {
        loggedIn: Boolean(localStorage.getItem("writingAppToken")),
        flashMessages: []
    }
    function appReducer(draft, action) {
        // By using the "immer" package we do not have to return the entire state of all properties
        // we can just modify the "draft"
        switch (action.type) {
            case "login":
                draft.loggedIn = true
                return
            case "logout":
                draft.loggedIn = false
                return
            case "addFlashMessage":
                // For "addFlashMessage" the action.value is set to the message being added to flash messages
                draft.flashMessages.push(action.value)
                return
        }
    }
    const [state, dispatch] = useImmerReducer(appReducer, initialState)

    // React does partial matching - so use "exact" keyword here so that it matches
    // the EXACT homepath
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages} />
                    <Header />
                    <Switch>
                        <Route path="/" exact>
                            {state.loggedIn ? <Home /> : <HomeGuest />}
                        </Route>
                        <Route path="/post/:id">
                            <ViewSinglePost />
                        </Route>
                        <Route path="/create-post">
                            <CreatePost />
                        </Route>
                        <Route path="/about-us">
                            <About />
                        </Route>
                        <Route path="/terms">
                            <Terms />
                        </Route>
                    </Switch>
                    <Footer />
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
    module.hot.accept()
}
