import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Header from './header'

import '../enzyme-conf.spec'

describe('<Header />', function() {
  it('renders', function() {
    shallow(<Header />)
  })

  it('contains the word Hackable', function() {
    const wrapper = shallow(<Header />)
    expect(wrapper).to.contain.text('Hackable')
  })
})
