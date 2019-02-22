import React from 'react'
import { render } from 'enzyme'
import { Snippet } from './snippet'

import '../enzyme-conf.spec'

describe('<Snippet />', function() {
  it('renders', function() {
    render(<Snippet snippet="http://example.com/badge.svg" />)
  })

  it('renders with truncate and fontSize', function() {
    render(
      <Snippet
        fontSize="14pt"
        snippet="http://example.com/badge.svg"
        truncate
      />
    )
  })
})
