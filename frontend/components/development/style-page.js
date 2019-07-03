import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { baseUrl } from '../../constants'
import Meta from '../meta'
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

function StyleTable({ style }) {
  return (
    <StyledTable>
      <thead>
        <tr>
          <td>Description</td>
          <td>Badges</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic examples</td>
          <td>
            <Badge
              alt="build"
              src={staticBadgeUrl({
                baseUrl,
                label: 'build',
                message: 'passing',
                color: 'brightgreen',
                style,
              })}
            />
            <br />
            <Badge
              alt="tests"
              src={staticBadgeUrl({
                baseUrl,
                label: 'tests',
                message: '5 passing, 1 failed',
                color: 'red',
                style,
              })}
            />
            <br />
            <Badge
              alt="pyversion"
              src={staticBadgeUrl({
                baseUrl,
                label: 'python',
                message: '3.5 | 3.6 | 3.7',
                color: 'blue',
                style,
              })}
            />
          </td>
        </tr>
        <tr>
          <td>Logo</td>
          <td>
            <Badge
              alt="build"
              src={staticBadgeUrl({
                baseUrl,
                label: 'build',
                message: 'passing',
                color: 'brightgreen',
                namedLogo: 'appveyor',
                style,
              })}
            />
          </td>
        </tr>
        <tr>
          <td>No left text</td>
          <td>
            <Badge
              alt="build"
              src={staticBadgeUrl({
                baseUrl,
                label: '',
                message: 'blueviolet',
                color: 'blueviolet',
                style,
              })}
            />
            <br />
            <Badge
              alt="build"
              src={staticBadgeUrl({
                baseUrl,
                label: '',
                message: 'passing',
                color: 'brightgreen',
                namedLogo: 'appveyor',
                style,
              })}
            />
          </td>
        </tr>
      </tbody>
    </StyledTable>
  )
}
StyleTable.propTypes = {
  style: PropTypes.string.isRequired,
}

export default function StylePage() {
  return (
    <div>
      <Meta />
      <Header />
      <H3>flat</H3>
      <StyleTable style="flat" />
      <H3>flat-square</H3>
      <StyleTable style="flat-square" />
      <H3>for-the-badge</H3>
      <StyleTable style="for-the-badge" />
      <H3>social</H3>
      <StyleTable style="social" />
      <H3>plastic</H3>
      <StyleTable style="plastic" />
    </div>
  )
}
