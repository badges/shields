import React from 'react'
import { shallow } from 'enzyme'
import Main from './main'

import './enzyme-conf.spec'

describe('<Main />', function() {
  it('renders without a category', function() {
    shallow(<Main pageContext={{}} />)
  })

  it('renders with a category', function() {
    shallow(
      <Main
        pageContext={{
          category: { id: 'build', name: 'Build' },
        }}
      />
    )
  })
})
