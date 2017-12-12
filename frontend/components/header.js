import React from 'react';

export default () => (
  <section>
    <img alt="Shields.io" src="static/logo.svg" />

    <hr className="spacing" />

    <p className="highlights">
      Pixel-perfect &nbsp;
      Retina-ready &nbsp;
      Fast &nbsp;
      Consistent &nbsp;
      Hackable &nbsp;
      No tracking
    </p>
    
    <p>
      <a className="link" href="https://github.com/pravdomil/shields">GitHub</a> &nbsp;
      <a className="link" href="https://opencollective.com/shields">donate</a>
    </p>

    <style jsx>{`
      .highlights {
        font-style: italic;
      }
      .link {
        text-decoration: none;
        color: rgba(0,0,0,0.5);
      }
    `}</style>
  </section>
);
