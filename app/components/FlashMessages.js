import React, { useEffect } from "react"

function FlashMessages(props) {
    return (
        <div className="floating-alerts">
            {props.messages.map((msg, index) => {
                return (
                    // Need to pass "key" here for react efficiency - to keep it unique
                    <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
                        {msg}
                    </div>
                )
            })}
        </div>
    )
}

export default FlashMessages
