import React, { useEffect } from "react"

function Container(props) {
    // Pass props for all of the content within the Container tags
    // props.children will expand all content passed within the tags
    return (
        <>
            <div className={"container py-md-5 " + (props.narrow ? "container--narrow" : "")}>{props.children}</div>
        </>
    )
}

export default Container
