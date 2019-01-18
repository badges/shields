import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
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
    definitions: PropTypes.array.isRequired,
    baseUrl: PropTypes.string,
    longCache: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  renderExample(exampleData) {
    const { baseUrl, longCache, onClick } = this.props
    const { title, example, preview } = exampleData

    let previewUrl
    // There are two alternatives for `preview`. Refer to the schema in
    // `services/service-definitions.js`.
    if (preview.label !== undefined) {
      const { label, message, color } = preview
      previewUrl = staticBadgeUrl({ baseUrl, label, message, color })
    } else {
      const { path, queryParams } = preview
      previewUrl = badgeUrlFromPath({ baseUrl, path, queryParams, longCache })
    }

    // There are two alternatives for `example`. Refer to the schema in
    // `services/service-definitions.js`.
    let exampleUrl
    if (example.pattern !== undefined) {
      const { pattern, namedParams, queryParams } = example
      exampleUrl = badgeUrlFromPath({
        baseUrl,
        path: pattern,
        namedParams,
        queryParams,
      })
    } else {
      const { path, queryParams } = example
      exampleUrl = badgeUrlFromPath({ baseUrl, path, queryParams })
    }

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

    if (!definitions) {
      return null
    }

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
