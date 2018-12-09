import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import { CategoryHeading, CategoryHeadings } from './category-headings'

import './enzyme-conf.spec'

const exampleCategories = [{ id: 'cat', name: 'Example category' }]

describe('<CategoryHeading />', function() {
  it('renders', function() {
    shallow(<CategoryHeading category={exampleCategories[0]} />)
  })

  it('contains the expected heading', function() {
    const wrapper = shallow(<CategoryHeading category={exampleCategories[0]} />)
    expect(wrapper).to.contain(<h3 id="cat">Example category</h3>)
  })
})

describe('<CategoryHeadings />', function() {
  it('renders', function() {
    shallow(<CategoryHeadings categories={exampleCategories} />)
  })

  it('contains a link to the status page', function() {
    const wrapper = shallow(<CategoryHeadings categories={exampleCategories} />)
    expect(wrapper).to.contain(
      <CategoryHeading category={exampleCategories[0]} />
    )
  })
})
