import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import resolveUrl from '../lib/resolve-url'
import { H2 } from './common'

const SpacedA = styled.a`
  margin-left: 10px;
  margin-right: 10px;
`

const Footer = ({ baseUrl }) => (
  <section>
    <H2 id="like-this">Like This?</H2>

    <p>
      <object
        data={resolveUrl(
          '/twitter/follow/shields_io.svg?style=social&label=Follow',
          baseUrl
        )}
        alt="Follow @shields_io"
      />{' '}
      {}
      <object
        data={resolveUrl(
          '/opencollective/backers/shields.svg?style=social&link=https://opencollective.com/shields',
          baseUrl
        )}
        alt="Donate to us!"
      />{' '}
      {}
      <object
        data={resolveUrl(
          '/opencollective/sponsors/shields.svg?style=social&link=https://opencollective.com/shields',
          baseUrl
        )}
        alt="Donate to us!"
      />{' '}
      {}
      <object
        data={resolveUrl(
          '/github/forks/badges/shields.svg?style=social&label=Fork',
          baseUrl
        )}
        alt="Fork on GitHub"
      />{' '}
      {}
      <object
        data={resolveUrl(
          '/discord/308323056592486420.svg?style=social&label=Chat&link=https://discord.gg/HjJCwm5',
          baseUrl
        )}
        alt="chat on Discord"
      />
    </p>

    <p>
      What is your favorite badge service to use?
      <br />
      <a href="https://github.com/badges/shields/blob/master/CONTRIBUTING.md">
        Tell us
      </a>{' '}
      and we might bring it to you!
    </p>

    <p>
      <SpacedA href="https://status.shields.io/">Status</SpacedA>
      <SpacedA href="https://github.com/badges/shields/">GitHub</SpacedA>
    </p>
  </section>
)
export default Footer
Footer.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}
