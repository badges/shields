import { Link } from 'react-router-dom'
import React from 'react'

export default () => (
  <section>
    <Link to="/">
      <img alt="Shields.io" src="/static/logo.svg" />
    </Link>

    <hr className="spacing" />

    <p className="highlights">
      Pixel-perfect &nbsp; Retina-ready &nbsp; Fast &nbsp; Consistent &nbsp;
      Hackable &nbsp; No tracking
    </p>

    <style jsx>{`
      .highlights {
        font-style: italic;
      }
    `}</style>
  </section>
)
