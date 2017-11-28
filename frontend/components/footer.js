import React from 'react';
import PropTypes from 'prop-types';

const Footer = ({ baseUri }) => (
  <section>
    <h2 id="like-this">Like This?</h2>

    <p>
      Tell your favorite badge service to use it! <br />
      And tell us, we might be able to bring it to you anyway!
    </p>
    <p>
      <object
        data={baseUri + "/twitter/follow/shields_io.svg?style=social&label=Follow"}
        alt="Follow @shields_io" />
      <object
        data={baseUri + "/gratipay/Shields.svg?style=social&label=Donate&link=https://www.gratipay.com/Shields/"}
        alt="Donate to us!" />
      <object
        data={baseUri + "/github/forks/badges/shields.svg?style=social&label=Fork"}
        alt="Fork on GitHub" />
      <object
        data={baseUri + "/discord/308323056592486420.svg?style=social&label=Chat&link=https://discord.gg/HjJCwm5"}
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
