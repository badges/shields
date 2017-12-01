import React from 'react';
import PropTypes from 'prop-types';
import resolveUri from '../lib/resolve-uri';

const Footer = ({ baseUri }) => (
  <section>
    <h2 id="like-this">Like This?</h2>

    <p>
      Tell your favorite badge service to use it! <br />
      And tell us, we might be able to bring it to you anyway!
    </p>
    <p>
      <object
        data={resolveUri('/twitter/follow/shields_io.svg?style=social&label=Follow', baseUri)}
        alt="Follow @shields_io" />
      <a href="https://opencollective.com/shields" alt="Donate to us!">
        <img src="https://opencollective.com/shields/backers/badge.svg" />
      </a>
      <a href="https://opencollective.com/shields" alt="Donate to us!">
        <img src="https://opencollective.com/shields/sponsors/badge.svg" />
      </a>
      <object
        data={resolveUri('/github/forks/badges/shields.svg?style=social&label=Fork', baseUri)}
        alt="Fork on GitHub" />
      <object
        data={resolveUri('/discord/308323056592486420.svg?style=social&label=Chat&link=https://discord.gg/HjJCwm5', baseUri)}
        alt="chat on Discord" />
    </p>
    <p>
      <a href="https://github.com/h5bp/lazyweb-requests/issues/150">This</a> is
      where the current server got started.
    </p>

    <p><small>:wq</small></p>
  </section>
);
export default Footer;
Footer.propTypes = {
  baseUri: PropTypes.string.isRequired,
};
