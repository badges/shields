import { Link } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'
import { VerticalSpace } from './common'

const Highlights = styled.p`
  font-style: italic;
`

export default () => (
  <section>
    <Link to="/">
      <img alt="Shields.io" src="/static/logo.svg" />
    </Link>

    <VerticalSpace />

    <Highlights>
      Pixel-perfect &nbsp; Retina-ready &nbsp; Fast &nbsp; Consistent &nbsp;
      Hackable &nbsp; No tracking
    </Highlights>
  </section>
)
