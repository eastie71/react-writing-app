import React, { useEffect, useContext, useRef } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import { Link } from "react-router-dom"
import io from "socket.io-client"

function Chat() {
    // Create a consistent mutable object so that web browser can hold on to server socket connection
    const socket = useRef(null)
    // Need to set the focus on the Chat field when Chat component is rendered
    const chatField = useRef(null)
    // Need to set the scroll to bottom of Chat window component - where the last message is
    const chatLog = useRef(null)

    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const [state, setState] = useImmer({
        fieldValue: "",
        chatMessages: []
    })

    // chatField - call this when chat window opens
    useEffect(() => {
        if (appState.chatOpen) {
            chatField.current.focus()
            appDispatch({ type: "clearUnreadChatCount" })
        }
    }, [appState.chatOpen])

    // chatLog of messages - call this whenever the messages change
    useEffect(() => {
        chatLog.current.scrollTop = chatLog.current.scrollHeight
        if (state.chatMessages.length && !appState.chatOpen) {
            appDispatch({ type: "incrementUnreadChatCount" })
        }
    }, [state.chatMessages])

    // Establish socket connection with server for chat messages
    useEffect(() => {
        // Open the socket connection with the server
        socket.current = io("http://localhost:8080")

        socket.current.on("chatFromServer", message => {
            setState(draft => {
                draft.chatMessages.push(message)
            })
        })
        // Cleanup (close) socket connection on exit
        return () => socket.current.disconnect()
    }, [])

    function handleFieldChange(e) {
        // Setting e.target.value to local var here - because cannot rely on it inside the setState call!
        const value = e.target.value
        setState(draft => {
            draft.fieldValue = value
        })
    }

    function handleSubmit(e) {
        e.preventDefault()
        // Send message to chat server
        socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })
        setState(draft => {
            // Add message to collection of messages
            draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
            draft.fieldValue = ""
        })
    }

    return (
        <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.chatOpen ? "chat-wrapper--is-visible" : "")}>
            <div className="chat-title-bar bg-primary">
                Chat
                <span onClick={() => appDispatch({ type: "closeChatWindow" })} className="chat-title-bar-close">
                    <i className="fas fa-times-circle"></i>
                </span>
            </div>
            <div ref={chatLog} id="chat" className="chat-log">
                {state.chatMessages.map((message, index) => {
                    if (message.username == appState.user.username) {
                        return (
                            <div key={index} className="chat-self">
                                <div className="chat-message">
                                    <div className="chat-message-inner">{message.message}</div>
                                </div>
                                <img className="chat-avatar avatar-tiny" src={message.avatar} />
                            </div>
                        )
                    }
                    {
                        /* Messages from users other than the current logged in user */
                    }
                    return (
                        <div key={index} className="chat-other">
                            <Link to={`/profile/${message.username}`}>
                                <img className="avatar-tiny" src={message.avatar} />
                            </Link>
                            <div className="chat-message">
                                <div className="chat-message-inner">
                                    <Link to={`/profile/${message.username}`}>
                                        <strong>{message.username}: </strong>
                                    </Link>
                                    {message.message}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
                <input value={state.fieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
            </form>
        </div>
    )
}

export default Chat
