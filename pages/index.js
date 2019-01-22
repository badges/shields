import React from 'react'
import { HashRouter, StaticRouter, Route } from 'react-router-dom'
import Main from '../frontend/components/main'
import EndpointPage from '../frontend/components/endpoint-page'

export default class Router extends React.Component {
  render() {
    const router = (
      <div>
        <Route path="/" exact component={Main} />
        <Route path="/examples/:category" component={Main} />
        <Route path="/endpoint" component={EndpointPage} />
      </div>
    )

    if (typeof window !== 'undefined') {
      // browser
      return <HashRouter>{router}</HashRouter>
    } else {
      // server-side rendering
      const context = {}
      return (
        <StaticRouter context={context} basename="#">
          {router}
        </StaticRouter>
      )
    }
  }
}
