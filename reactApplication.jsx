import React from 'react'
import ReactDOM from 'react-dom'

class Application extends React.Component {
    render() {
        return (
            <h2>
                <span simple-initialized-editable="greeting">
                    Hello react version
                </span>
                {' '}
                {React.version}
            </h2>
        )
    }
}
ReactDOM.render(
    <Application />, window.document.querySelector('react-application'))
