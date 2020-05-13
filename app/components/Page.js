import React, { useEffect } from "react"
import Container from "./Container"

function Page(props) {
    // Watch the "props.title" variable and if modified then reset the values
    useEffect(() => {
        document.title = `${props.title} | WritingApp`
        window.scrollTo(0, 0)
    }, [props.title])
    return <Container narrow={props.narrow}>{props.children}</Container>
}

export default Page
