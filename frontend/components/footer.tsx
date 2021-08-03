import React from 'react'
import styled from 'styled-components'
import { badgeUrlFromPath } from '../../core/badge-urls/make-badge-url'
import { H2 } from './common'

const SpacedA = styled.a`
  margin-left: 10px;
  margin-right: 10px;
`

export default function Footer({ baseUrl }: { baseUrl: string }): JSX.Element {
  return (
    <section>
      <H2 id="like-this">Like This?</H2>

      <p>
        <object
          data={badgeUrlFromPath({
            baseUrl,
            path: '/twitter/follow/shields_io',
            queryParams: { label: 'Follow' },
            style: 'social',
          })}
        />{' '}
        {}
        <object
          data={badgeUrlFromPath({
            baseUrl,
            path: '/opencollective/backers/shields',
            queryParams: { link: 'https://opencollective.com/shields' },
            style: 'social',
          })}
        />{' '}
        {}
        <object
          data={badgeUrlFromPath({
            baseUrl,
            path: '/opencollective/sponsors/shields',
            queryParams: { link: 'https://opencollective.com/shields' },
            style: 'social',
          })}
        />{' '}
        {}
        <object
          data={badgeUrlFromPath({
            baseUrl,
            path: '/github/forks/badges/shields',
            queryParams: { label: 'Fork' },
            style: 'social',
          })}
        />{' '}
        {}
        <object
          data={badgeUrlFromPath({
            baseUrl,
            path: '/discord/308323056592486420',
            queryParams: {
              label: 'Chat',
              link: 'https://discord.gg/HjJCwm5',
            },
            style: 'social',
          })}
        />
      </p>

      <p>
        Have an idea for an awesome new badge?
        <br />
        <a href="https://github.com/badges/shields/issues/new?labels=service-badge&template=3_Badge_request.md">
          Tell us about it
        </a>{' '}
        and we might bring it to you!
      </p>

      <p>
        <SpacedA href="/community">Community</SpacedA>
        <SpacedA href="https://stats.uptimerobot.com/PjXogHB5p">Status</SpacedA>
        <SpacedA href="https://metrics.shields.io">Metrics</SpacedA>
        <SpacedA href="https://github.com/badges/shields">GitHub</SpacedA>
      </p>
    </section>
  )
}
