import React, { useEffect } from "react"

function FlashMessages(props) {
    let alertType
    return (
        <div className="floating-alerts">
            {props.messages.map((msg, index) => {
                switch (msg.type) {
                    case "good":
                        alertType = "alert-success"
                        break
                    case "info":
                        alertType = "alert-info"
                        break
                    case "error":
                        alertType = "alert-danger"
                        break
                    case "warn":
                        alertType = "alert-warning"
                        break
                    default:
                        alertType = "alert-success"
                        break
                }
                return (
                    // Need to pass "key" here for react efficiency - to keep it unique
                    <div key={index} className={"alert text-center floating-alert shadow-sm " + alertType}>
                        {msg.value}
                    </div>
                )
            })}
        </div>
    )
}

export default FlashMessages
