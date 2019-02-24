import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import { serviceDefinitionPropType } from '../lib/service-definitions/service-definition-prop-types'
import { Badge } from './common'
import { StyledCode } from './snippet'

const ExampleTable = styled.table`
  min-width: 50%;
  margin: auto;

  th,
  td {
    text-align: left;
  }
`

const ClickableTh = styled.th`
  cursor: pointer;
`

const ClickableCode = styled(StyledCode)`
  cursor: pointer;
`

export default class BadgeExamples extends React.Component {
  static propTypes = {
    definitions: PropTypes.arrayOf(serviceDefinitionPropType).isRequired,
    baseUrl: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  }

  renderExample(exampleData) {
    const { baseUrl, onClick } = this.props
    const { title, example, preview } = exampleData

    const { label, message, color, style, namedLogo } = preview
    const previewUrl = staticBadgeUrl({
      baseUrl,
      label,
      message,
      color,
      style,
      namedLogo,
    })

    const { pattern, namedParams, queryParams } = example
    const exampleUrl = badgeUrlFromPath({
      baseUrl,
      path: pattern,
      namedParams,
      queryParams,
    })

    const key = `${title} ${previewUrl} ${exampleUrl}`

    const handleClick = () => onClick(exampleData)

    return (
      <tr key={key}>
        <ClickableTh onClick={handleClick}>{title}:</ClickableTh>
        <td>
          <Badge clickable onClick={handleClick} src={previewUrl} />
        </td>
        <td>
          <ClickableCode onClick={handleClick}>{exampleUrl}</ClickableCode>
        </td>
      </tr>
    )
  }

  render() {
    const { definitions } = this.props

    const flattened = definitions.reduce((accum, current) => {
      const { examples } = current
      return accum.concat(examples)
    }, [])

    return (
      <ExampleTable>
        <tbody>
          {flattened.map(exampleData => this.renderExample(exampleData))}
        </tbody>
      </ExampleTable>
    )
  }
}
