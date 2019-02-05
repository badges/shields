import { Link } from 'gatsby'
import React from 'react'
import styled from 'styled-components'
import { VerticalSpace } from './common'
import Logo from '../images/logo.svg'

const Highlights = styled.p`
  font-style: italic;
`

export default () => (
  <section>
    <Link to="/">
      <Logo />
    </Link>

    <VerticalSpace />

    <Highlights>
      Pixel-perfect &nbsp; Retina-ready &nbsp; Fast &nbsp; Consistent &nbsp;
      Hackable &nbsp; No tracking
    </Highlights>
  </section>
)
