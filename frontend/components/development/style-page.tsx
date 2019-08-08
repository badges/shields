import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
// @ts-ingnore
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { baseUrl } from '../../constants'
import Meta from '../meta'
// @ts-ignore
import Header from '../header'
import { H3, Badge } from '../common'

const StyledTable = styled.table`
  border: 1px solid #ccc;
  border-collapse: collapse;

  td {
    border: 1px solid #ccc;
    padding: 3px;
    text-align: left;
  }
`

interface BadgeData {
  label: string
  message: string
  color: string
  namedLogo?: string
}

function Badges({
  baseUrl,
  style,
  badges,
}: {
  baseUrl: string
  style: string
  badges: BadgeData[]
}) {
  return (
    <Fragment>
      {badges.map(({ label, message, color }) => (
        <Fragment>
          <Badge
            alt="build"
            src={staticBadgeUrl({ baseUrl, label, message, color, style })}
          />
          <br />
        </Fragment>
      ))}
    </Fragment>
  )
}

interface StyleExamples {
  title: string
  badges: BadgeData[]
}

const examples = [
  {
    title: 'Basic examples',
    badges: [
      { label: 'build', message: 'passing', color: 'brightgreen' },
      { label: 'tests', message: '5 passing, 1 failed', color: 'red' },
      { label: 'python', message: '3.5 | 3.6 | 3.7', color: 'blue' },
    ],
  },
  {
    title: 'Logo',
    badges: [
      {
        label: 'build',
        message: 'passing',
        color: 'brightgreen',
        namedLogo: 'appveyor',
      },
    ],
  },
  {
    title: 'No left text',
    badges: [
      { label: '', message: 'blueviolet', color: 'blueviolet' },
      {
        label: '',
        message: 'passing',
        color: 'brightgreen',
        namedLogo: 'appveyor',
      },
    ],
  },
]

function StyleTable({ style }: { style: string }) {
  return (
    <StyledTable>
      <thead>
        <tr>
          <td>Description</td>
          <td>Badges (new)</td>
          <td>Badges (old)</td>
        </tr>
      </thead>
      <tbody>
        {examples.map(({ title, badges }) => (
          <tr>
            <td>{title}</td>
            <td>
              <Badges baseUrl={baseUrl} style={style} badges={badges} />
            </td>
            <td>
              <Badges
                baseUrl="http://localhost:8081"
                style={style}
                badges={badges}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  )
}

const styles = ['flat', 'flat-square', 'for-the-badge', 'social', 'plastic']

export default function StylePage() {
  return (
    <div>
      <Meta />
      <Header />
      {styles.map(style => (
        <Fragment>
          <H3>{style}</H3>
          <StyleTable style={style} />
        </Fragment>
      ))}
    </div>
  )
}
