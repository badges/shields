import React from 'react'
import { shallow } from 'enzyme'
import EndpointPage from './endpoint'

import '../enzyme-conf.spec'

describe('<EndpointPage />', function() {
  it('renders', function() {
    shallow(<EndpointPage pageContext={{}} />)
  })
})
