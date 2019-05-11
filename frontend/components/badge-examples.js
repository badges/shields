import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import { examplePropType } from '../lib/service-definitions/example-prop-types'
import { removeRegexpFromPattern } from '../lib/pattern-helpers'
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

function Example({ baseUrl, onClick, exampleData }) {
  const { title, example, preview, isBadgeSuggestion } = exampleData
  const { pattern, namedParams, queryParams } = example
  let exampleUrl
  let previewUrl

  if (isBadgeSuggestion) {
    exampleUrl = badgeUrlFromPattern({
      baseUrl,
      pattern,
      namedParams,
      queryParams,
    })
    previewUrl = exampleUrl
  } else {
    const { label, message, color, style, namedLogo } = preview
    previewUrl = staticBadgeUrl({
      baseUrl,
      label,
      message,
      color,
      style,
      namedLogo,
    })
    exampleUrl = badgeUrlFromPath({
      path: removeRegexpFromPattern(pattern),
      namedParams,
      queryParams,
    })
  }

  const handleClick = () => onClick(exampleData)

  return (
    <tr>
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
Example.propTypes = {
  exampleData: examplePropType.isRequired,
  baseUrl: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}

export default function BadgeExamples({ examples, baseUrl, onClick }) {
  return (
    <ExampleTable>
      <tbody>
        {examples.map(exampleData => (
          <Example
            baseUrl={baseUrl}
            exampleData={exampleData}
            key={`${exampleData.title} ${exampleData.example.pattern}`}
            onClick={onClick}
          />
        ))}
      </tbody>
    </ExampleTable>
  )
}
BadgeExamples.propTypes = {
  examples: PropTypes.arrayOf(examplePropType).isRequired,
  baseUrl: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}
