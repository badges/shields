import React from 'react'
import Main from '../components/main'
import redirectLegacyRoutes from '../lib/redirect-legacy-routes'

export default class IndexPage extends React.Component {
  render() {
    // It seems like putting this in `componentDidMount()` should work.
    // however, that does not seem to be called often enough, resulting in the
    // redirect sometimes not occurring.
    if (typeof window !== 'undefined') {
      redirectLegacyRoutes()
    }

    return <Main {...this.props} />
  }
}
