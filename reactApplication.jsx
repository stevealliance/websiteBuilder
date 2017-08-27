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
const main = () => ReactDOM.render(
    <Application />, window.document.querySelector('react-application'))
websiteBuilder ? websiteBuilder.registerOnChange(main) : main()
