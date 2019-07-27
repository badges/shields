import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Usage from './usage'

import '../enzyme-conf.spec'

describe('<Usage />', function() {
  it('renders', function() {
    shallow(<Usage baseUrl="https://example.shields.io" />)
  })

  it('contains some of the expected text', function() {
    const wrapper = shallow(<Usage baseUrl="https://example.shields.io" />)
    expect(wrapper).to.contain.text('For backward compatibility')
  })

  // This test requires Link to be mocked.
  //   const wrapper = render(<Usage baseUrl="https://example.shields.io" />)
  //   expect(wrapper.html()).to.contain(
  //     'needed for spaces or special characters!'
  //   )
  // })
})
