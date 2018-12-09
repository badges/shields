import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Footer from './footer'

import './enzyme-conf.spec'

describe('<Footer />', function() {
  it('renders', function() {
    shallow(<Footer baseUrl="https://example.shields.io" />)
  })

  it('contains a link to the status page', function() {
    const wrapper = shallow(<Footer baseUrl="https://example.shields.io" />)
    expect(wrapper).to.contain(<a href="https://status.shields.io/">Status</a>)
  })
})
