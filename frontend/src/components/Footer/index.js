import React from 'react'
import { useColorMode } from '@docusaurus/theme-common'

export default function Footer() {
  const { colorMode } = useColorMode()

  const footerStyle = {
    backgroundColor: colorMode === 'dark' ? '#1b1b1d' : '#f5f6f7',
    color: colorMode === 'dark' ? '#e3e3e3' : '#1c1e21',
    borderTop: `1px solid ${colorMode === 'dark' ? '#333' : '#e6e6e6'}`,
    padding: '2rem 0',
    transition: 'all 0.3s ease',
  }

  return (
    <footer style={footerStyle}>
      <div className="container">
        <div className="row">
          <div className="col footer__col">
            <div className="footer__title">Community</div>
            <ul className="footer__items clean-list">
              <li className="footer__item">
                <a
                  href="https://github.com/badges/shields"
                  className="footer__link-item"
                >
                  GitHub
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://opencollective.com/shields"
                  className="footer__link-item"
                >
                  Open Collective
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://discord.gg/HjJCwm5"
                  className="footer__link-item"
                >
                  Discord
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://github.com/badges/awesome-badges"
                  className="footer__link-item"
                >
                  Awesome Badges
                </a>
              </li>
            </ul>
          </div>
          <div className="col footer__col">
            <div className="footer__title">Stats</div>
            <ul className="footer__items clean-list">
              <li className="footer__item">
                <a
                  href="https://badges.github.io/uptime-monitoring/"
                  className="footer__link-item"
                >
                  Service Status (Upptime)
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://nodeping.com/reports/status/YBISBQB254"
                  className="footer__link-item"
                >
                  Service Status (NodePing)
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://metrics.shields.io/"
                  className="footer__link-item"
                >
                  Metrics dashboard
                </a>
              </li>
            </ul>
          </div>
          <div className="col footer__col">
            <div className="footer__title">Policy</div>
            <ul className="footer__items clean-list">
              <li className="footer__item">
                <a href="/privacy" className="footer__link-item">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom text--center">
          <div className="footer__copyright">
            Copyright © {new Date().getFullYear()} Shields.io. Built with
            Docusaurus.
          </div>
        </div>
      </div>
    </footer>
  )
}
