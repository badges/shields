import { Link } from 'gatsby'
import React from 'react'
import styled from 'styled-components'
import Logo from '../images/logo.svg'
import { VerticalSpace } from './common'

const Highlights = styled.p`
  font-style: italic;
`

export default function Header(): JSX.Element {
  return (
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
}
