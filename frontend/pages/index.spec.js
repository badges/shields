import React from 'react'
import { shallow } from 'enzyme'
import IndexPage from '.'

import '../enzyme-conf.spec'

describe('<IndexPage />', function() {
  it('renders', function() {
    shallow(<IndexPage pageContext={{}} />)
  })
})
