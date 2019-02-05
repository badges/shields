import React from 'react'
import Main from '../components/main'
import redirectLegacyRoutes from '../lib/redirect-legacy-routes'

export default class IndexPage extends React.Component {
  render() {
    redirectLegacyRoutes()
    return <Main {...this.props} />
  }
}
