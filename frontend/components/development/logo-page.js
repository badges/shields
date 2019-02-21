import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { baseUrl } from '../../constants'
import Meta from '../meta'
import Header from '../header'
import { H3, Badge } from '../common'
import { shieldsLogos, simpleIcons } from '../../../supported-features.json'

const StyledTable = styled.table`
  border: 1px solid #ccc;
  border-collapse: collapse;

  td {
    border: 1px solid #ccc;
    padding: 3px;
    text-align: left;
  }
`

const NamedLogoTable = ({ logoNames }) => (
  <StyledTable>
    <thead>
      <tr>
        <td>Flat</td>
        <td>Social</td>
      </tr>
    </thead>
    <tbody>
      {logoNames.map(name => (
        <tr key={name}>
          <td>
            <Badge
              alt={`logo: ${name}`}
              src={staticBadgeUrl({
                baseUrl,
                label: 'named logo',
                message: name,
                color: 'blue',
                namedLogo: name,
              })}
            />
          </td>
          <td>
            <Badge
              alt={`logo: ${name}`}
              src={staticBadgeUrl({
                baseUrl,
                label: 'Named Logo',
                message: name,
                color: 'blue',
                namedLogo: name,
                style: 'social',
              })}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </StyledTable>
)
NamedLogoTable.propTypes = {
  logoNames: PropTypes.arrayOf(PropTypes.string).isRequired,
}

const LogoPage = () => (
  <div>
    <Meta />
    <Header />
    <H3>Named logos</H3>
    <NamedLogoTable logoNames={shieldsLogos} />
    <H3>Simple-icons</H3>
    <NamedLogoTable logoNames={simpleIcons} />
  </div>
)
export default LogoPage
