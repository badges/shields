import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Meta from './meta'

import './enzyme-conf.spec'

describe('<Meta />', function() {
  it('renders', function() {
    shallow(<Meta />)
  })

  it('sets the page title', function() {
    const wrapper = shallow(<Meta />)
    expect(wrapper).to.contain(
      <title>
        Shields.io: Quality metadata badges for open source projects
      </title>
    )
  })
})
