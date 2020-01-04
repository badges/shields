import React from 'react'
import styled from 'styled-components'

const Donate = styled.div`
  padding: 25px 50px;
`

export default function DonateBox(): JSX.Element {
  return (
    <Donate>
      Love Shields? Please consider{' '}
      <a href="https://opencollective.com/shields">donating</a> to sustain our
      activities
    </Donate>
  )
}
