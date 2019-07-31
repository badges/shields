import React from 'react'
import { shallow, render } from 'enzyme'
import { expect } from 'chai'
import * as common from './common'

// @ts-ignore
import '../enzyme-conf.spec'

describe('Common modules', function() {
  describe('<GlobalStyle />', function() {
    it('renders', function() {
      shallow(<common.GlobalStyle />)
    })
  })

  describe('<BaseFont />', function() {
    it('renders', function() {
      shallow(<common.BaseFont />)
    })
  })

  describe('<H2 />', function() {
    it('renders', function() {
      shallow(<common.H2 />)
    })
  })

  describe('<H3 />', function() {
    it('renders', function() {
      shallow(<common.H3 />)
    })
  })

  describe('<Badge />', function() {
    it('renders', function() {
      shallow(<common.Badge src="/badge/foo-bar-blue" />)
    })

    it('contains a link to the image', function() {
      const wrapper = render(<common.Badge src="/badge/foo-bar-blue" />)
      expect(wrapper.html()).to.contain('<img alt src="/badge/foo-bar-blue">')
    })
  })

  describe('<StyledInput />', function() {
    it('renders', function() {
      shallow(<common.StyledInput />)
    })
  })

  describe('<InlineInput />', function() {
    it('renders', function() {
      shallow(<common.InlineInput />)
    })
  })

  describe('<BlockInput />', function() {
    it('renders', function() {
      shallow(<common.BlockInput />)
    })
  })

  describe('<VerticalSpace />', function() {
    it('renders', function() {
      shallow(<common.VerticalSpace />)
    })
  })
})
