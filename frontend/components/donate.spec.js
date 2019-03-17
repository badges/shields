import React from 'react'
import { shallow, render } from 'enzyme'
import { expect } from 'chai'
import Donate from './donate'

import '../enzyme-conf.spec'

describe('<Donate />', function() {
  it('renders', function() {
    shallow(<Donate />)
  })

  it('contains a link to open collective', function() {
    const wrapper = render(<Donate />)
    expect(wrapper.html()).to.contain('https://opencollective.com/shields')
  })
})
