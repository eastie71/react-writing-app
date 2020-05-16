import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"
import PostLine from "./PostLine"

function Search() {
    const appDispatch = useContext(DispatchContext)

    const [state, setState] = useImmer({
        searchEntry: "",
        results: [],
        show: "neither",
        requestCount: 0
    })

    useEffect(() => {
        document.addEventListener("keyup", searchKeyPressHandler)
        return () => document.removeEventListener("keyup", searchKeyPressHandler)
    }, [])

    useEffect(() => {
        if (state.searchEntry.trim()) {
            setState(draft => {
                draft.show = "loading"
            })
            const delay = setTimeout(() => {
                setState(draft => {
                    draft.requestCount++
                })
            }, 600)

            return () => clearTimeout(delay)
        } else {
            setState(draft => {
                draft.show = "neither"
            })
        }
    }, [state.searchEntry])

    useEffect(() => {
        if (state.requestCount) {
            const searchRequest = Axios.CancelToken.source()
            async function fetchSearchResults() {
                try {
                    const response = await Axios.post("/search", { searchTerm: state.searchEntry }, { cancelToken: searchRequest.token })
                    setState(draft => {
                        draft.results = response.data
                        draft.show = "results"
                    })
                } catch (error) {
                    console.log("A problem occurred while searching or the user cancelled.")
                }
            }
            fetchSearchResults()
            return () => searchRequest.cancel()
        }
    }, [state.requestCount])

    function searchKeyPressHandler(e) {
        // If user presses ESC key = then close the Search window
        if (e.keyCode == 27) {
            appDispatch({ type: "closeSearch" })
        }
    }

    function handleInput(e) {
        const value = e.target.value
        setState(draft => {
            draft.searchEntry = value
        })
    }

    return (
        <div className="search-overlay">
            <div className="search-overlay-top shadow-sm">
                <div className="container container--narrow">
                    <label htmlFor="live-search-field" className="search-overlay-icon">
                        <i className="fas fa-search"></i>
                    </label>
                    <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
                    <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
                        <i className="fas fa-times-circle"></i>
                    </span>
                </div>
            </div>

            <div className="search-overlay-bottom">
                <div className="container container--narrow py-3">
                    <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
                    <div className={"live-search-results" + (state.show == "results" ? "live-search-results--visible" : "")}>
                        {Boolean(state.results.length) && (
                            <div className="list-group shadow-sm">
                                <div className="list-group-item active">
                                    <strong>Search Results</strong> ({state.results.length} {state.results.length == 1 ? "item" : "items"} found)
                                </div>
                                {state.results.map(post => {
                                    return <PostLine post={post} onClick={() => appDispatch({ type: "closeSearch" })} />
                                })}
                            </div>
                        )}
                        {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, no results found.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Search
