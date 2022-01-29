import React from 'react'
import styled from 'styled-components'
import { getBaseUrl } from '../constants'
import Meta from '../components/meta'
import Header from '../components/header'
import Footer from '../components/footer'
import { BaseFont, GlobalStyle, H3 } from '../components/common'
import NodePing from '../../static/images/nodeping.svg'
import Sentry from '../../static/images/sentry-logo-black.svg'
const MainContainer = styled(BaseFont)`
  text-align: center;
`

const SponsorContainer = styled.div`
  display: block;
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
  padding-top: 20px;
`

const SponsorItems = styled.div`
  text-align: left;
`

export default function SponsorsPage(): JSX.Element {
  const baseUrl = getBaseUrl()
  return (
    <MainContainer>
      <GlobalStyle />
      <Meta />
      <Header />
      <H3>Community</H3>

      <SponsorContainer>
        Shields.io is possible thanks to the people and companies who donate
        money, services or time to keep the project running.
      </SponsorContainer>

      <SponsorContainer>
        <h4>Sponsors</h4>
        ❤️ These companies help us by donating their services to shields:
        <ul style={{ listStyleType: 'none' }}>
          <SponsorItems>
            <li>
              <a href="https://nodeping.com/">
                <NodePing alt="nodeping_logo" height={60} />
              </a>
            </li>
            <li>
              <a href="https://sentry.io/">
                <Sentry alt="sentry_logo" height={100} />
              </a>
            </li>
          </SponsorItems>
        </ul>
        💵 These organisations help keep shields running by donating on
        OpenCollective. Your organisation can support this project by{' '}
        <a href="https://opencollective.com/shields#sponsor">
          becoming a sponsor
        </a>
        . Your logo will show up here with a link to your website.
        <p>
          <object data="https://opencollective.com/shields/sponsors.svg?avatarHeight=80&width=600" />
        </p>
      </SponsorContainer>

      <SponsorContainer>
        <h4>Backers</h4>
        💵 Thank you to all our backers who help keep shields running by
        donating on OpenCollective. You can support this project by{' '}
        <a href="https://opencollective.com/shields#backer">
          becoming a backer
        </a>
        .
        <p>
          <object data="https://opencollective.com/shields/backers.svg?width=600" />
        </p>
      </SponsorContainer>

      <SponsorContainer>
        <h4>Contributors</h4>
        🙏 This project exists thanks to all the nice people who contribute
        their time to work on the project.
        <p>
          <object data="https://opencollective.com/shields/contributors.svg?width=600" />
        </p>
      </SponsorContainer>

      <SponsorContainer>
        ✨ Shields is helped by these companies which provide a free plan for
        their product or service:
        <ul>
          <li>
            <a href="https://coveralls.io/">Coveralls</a>
          </li>
          <li>
            <a href="https://circleci.com/">CircleCI</a>
          </li>
          <li>
            <a href="https://www.cloudflare.com/">Cloudflare</a>
          </li>
          <li>
            <a href="https://discord.com/">Discord</a>
          </li>
          <li>
            <a href="https://github.com/">GitHub</a>
          </li>
          <li>
            <a href="https://lgtm.com/">LGTM</a>
          </li>
          <li>
            <a href="https://uptimerobot.com/">Uptime Robot</a>
          </li>
        </ul>
      </SponsorContainer>

      <Footer baseUrl={baseUrl} />
    </MainContainer>
  )
}
