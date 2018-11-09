import React from 'react'
import PropTypes from 'prop-types'
import resolveUrl from '../lib/resolve-url'

const Footer = ({ baseUrl }) => (
  <section>
    <h2 id="like-this">Like This?</h2>

    <p>
      <object
        data={resolveUrl(
          '/twitter/follow/shields_io.svg?style=social&label=Follow',
          baseUrl
        )}
        alt="Follow @shields_io"
      />{' '}
      {}
      <a href="https://opencollective.com/shields" alt="Donate to us!">
        <img src="https://opencollective.com/shields/backers/badge.svg?style=social" />
      </a>{' '}
      {}
      <a href="https://opencollective.com/shields" alt="Donate to us!">
        <img src="https://opencollective.com/shields/sponsors/badge.svg?style=social" />
      </a>{' '}
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

    <p className="spaced-row">
      <a href="https://status.shields.io/">Status</a>
      <a href="https://github.com/badges/shields/">GitHub</a>
    </p>
  </section>
)
export default Footer
Footer.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}
