import React, { useEffect } from "react"
import Container from "./Container"

function Page(props) {
    // only run ONCE - the first time this component is rendered.
    // this is only run once because 2nd argument is what react will watch for state change
    // which in this case is an empty array.
    useEffect(() => {
        document.title = `${props.title} | WritingApp`
        window.scrollTo(0, 0)
    }, [])
    return <Container narrow={props.narrow}>{props.children}</Container>
}

export default Page
