import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
Axios.defaults.baseURL = process.env.BACKENDURL || ""

import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// Components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
import LoadingDotsIcon from "./components/LoadingDotsIcon"
// Lazy load components - using Suspense
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))

function Main() {
    const initialState = {
        loggedIn: Boolean(localStorage.getItem("writingAppToken")),
        searchOpen: false,
        chatOpen: false,
        unreadChatCount: 0,
        flashMessages: [],
        user: {
            token: localStorage.getItem("writingAppToken"),
            username: localStorage.getItem("writingAppUsername"),
            avatar: localStorage.getItem("writingAppAvatar")
        }
    }
    function appReducer(draft, action) {
        // By using the "immer" package we do not have to return the entire state of all properties
        // we can just modify the "draft"
        switch (action.type) {
            case "login":
                draft.loggedIn = true
                draft.user = action.userdata
                return
            case "logout":
                draft.loggedIn = false
                return
            case "addFlashMessage":
                // For "addFlashMessage" the action.value is set to the message being added to flash messages
                draft.flashMessages.push(action.value)
                return
            case "openSearch":
                draft.searchOpen = true
                return
            case "closeSearch":
                draft.searchOpen = false
                return
            case "toggleChatWindow":
                draft.chatOpen = !draft.chatOpen
                return
            case "closeChatWindow":
                draft.chatOpen = false
                return
            case "incrementUnreadChatCount":
                draft.unreadChatCount++
                return
            case "clearUnreadChatCount":
                draft.unreadChatCount = 0
                return
        }
    }
    const [state, dispatch] = useImmerReducer(appReducer, initialState)

    useEffect(() => {
        if (state.loggedIn) {
            // Save user data to localStorage
            localStorage.setItem("writingAppToken", state.user.token)
            localStorage.setItem("writingAppUsername", state.user.username)
            localStorage.setItem("writingAppAvatar", state.user.avatar)
        } else {
            // Remove user data from localStorage
            localStorage.removeItem("writingAppToken")
            localStorage.removeItem("writingAppUsername")
            localStorage.removeItem("writingAppAvatar")
        }
    }, [state.loggedIn])

    // Check if TOKEN has EXPIRED on first render
    useEffect(() => {
        if (state.loggedIn) {
            const tokenCheckRequest = Axios.CancelToken.source()
            async function checkTokenRequest() {
                try {
                    const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: tokenCheckRequest.token })
                    if (!response.data) {
                        // If token expired then force logout and ask user to login again
                        dispatch({ type: "logout" })
                        dispatch({ type: "addFlashMessage", value: "Your session has expired. Please login again" })
                    }
                } catch (error) {
                    console.log("A problem occurred while checking user token or the user cancelled.")
                }
            }
            checkTokenRequest()
            return () => tokenCheckRequest.cancel()
        }
    }, [])

    // React does partial matching - so use "exact" keyword is used here so that it matches
    // the EXACT path
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages} />
                    <Header />
                    <Suspense fallback={<LoadingDotsIcon />}>
                        <Switch>
                            <Route path="/profile/:username">
                                <Profile />
                            </Route>
                            <Route path="/" exact>
                                {state.loggedIn ? <Home /> : <HomeGuest />}
                            </Route>
                            <Route path="/post/:id" exact>
                                <ViewSinglePost />
                            </Route>
                            <Route path="/post/:id/edit" exact>
                                <EditPost />
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
                            <Route>
                                <NotFound />
                            </Route>
                        </Switch>
                    </Suspense>
                    <CSSTransition timeout={330} in={state.searchOpen} classNames="search-overlay" unmountOnExit>
                        {/* CSSTransition adds classes to its nearest child element - so need to have the "div" wrapper here 
                            and THEN the "Suspense" (for lazy loading) - ie. dont want CCSTransition added classes to the
                            "Suspense" element.
                            No need to have a "Loading..." here so set the fallback to an empty string */}
                        <div className="search-overlay">
                            <Suspense fallback="">
                                <Search />
                            </Suspense>
                        </div>
                    </CSSTransition>
                    {/* No need to load Chat component if not logged in */}
                    <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
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
