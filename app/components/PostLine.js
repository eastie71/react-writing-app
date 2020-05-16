import React, { useEffect } from "react"
import { Link } from "react-router-dom"

function PostLine(props) {
    const authorRequired = !props.suppressAuthor
    const post = props.post
    const postDate = new Date(post.createdDate)
    const postDateFormatted = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`
    return (
        <Link onClick={props.onClick} key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
            {authorRequired && (
                <>
                    <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
                    <span className="text-muted small">
                        by {post.author.username} on {postDateFormatted}{" "}
                    </span>
                </>
            )}
            {!authorRequired && (
                <>
                    <strong>{post.title}</strong> <span className="text-muted small"> on {postDateFormatted} </span>
                </>
            )}
        </Link>
    )
}

export default PostLine
