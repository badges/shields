import React from 'react'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import { removeRegexpFromPattern } from '../lib/pattern-helpers'
import {
  Example as ExampleData,
  Suggestion,
  RenderableExample,
} from '../lib/service-definitions'
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

function Example({
  baseUrl,
  onClick,
  exampleData,
  isBadgeSuggestion,
}: {
  baseUrl?: string
  onClick: (example: RenderableExample, isSuggestion: boolean) => void
  exampleData: RenderableExample
  isBadgeSuggestion: boolean
}): JSX.Element {
  const handleClick = React.useCallback(
    function (): void {
      onClick(exampleData, isBadgeSuggestion)
    },
    [exampleData, isBadgeSuggestion, onClick]
  )

  let exampleUrl, previewUrl
  if (isBadgeSuggestion) {
    const {
      example: { pattern, namedParams, queryParams },
    } = exampleData as Suggestion
    exampleUrl = previewUrl = badgeUrlFromPattern({
      baseUrl,
      pattern,
      namedParams,
      queryParams,
    })
  } else {
    const {
      example: { pattern, queryParams },
      preview: { label, message, color, style, namedLogo },
    } = exampleData as ExampleData
    previewUrl = staticBadgeUrl({
      baseUrl,
      label: label || '',
      message,
      color,
      style,
      namedLogo,
    })
    exampleUrl = badgeUrlFromPath({
      path: removeRegexpFromPattern(pattern),
      queryParams,
    })
  }

  const { title } = exampleData
  return (
    <tr>
      <ClickableTh onClick={handleClick}>{title}:</ClickableTh>
      <td>
        <Badge
          alt={`${title} badge`}
          clickable
          onClick={handleClick}
          src={previewUrl}
        />
      </td>
      <td>
        <ClickableCode onClick={handleClick}>{exampleUrl}</ClickableCode>
      </td>
    </tr>
  )
}

export function BadgeExamples({
  examples,
  areBadgeSuggestions,
  baseUrl,
  onClick,
}: {
  examples: RenderableExample[]
  areBadgeSuggestions: boolean
  baseUrl?: string
  onClick: (exampleData: RenderableExample, isSuggestion: boolean) => void
}): JSX.Element {
  return (
    <ExampleTable>
      <tbody>
        {examples.map(exampleData => (
          <Example
            baseUrl={baseUrl}
            exampleData={exampleData}
            isBadgeSuggestion={areBadgeSuggestions}
            key={`${exampleData.title} ${exampleData.example.pattern}`}
            onClick={onClick}
          />
        ))}
      </tbody>
    </ExampleTable>
  )
}
