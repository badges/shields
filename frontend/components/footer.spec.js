import React from 'react'
import { shallow, render } from 'enzyme'
import { expect } from 'chai'
import Footer from './footer'

import '../enzyme-conf.spec'

describe('<Footer />', function() {
  it('renders', function() {
    shallow(<Footer baseUrl="https://example.shields.io" />)
  })

  it('contains a link to the status page', function() {
    const wrapper = render(<Footer baseUrl="https://example.shields.io" />)
    expect(wrapper.html()).to.contain('https://status.shields.io/')
  })
})
