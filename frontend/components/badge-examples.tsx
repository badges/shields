import React from 'react'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import { removeRegexpFromPattern } from '../lib/pattern-helpers'
import {
  Example as ExampleData,
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
}: {
  baseUrl?: string
  onClick: (example: RenderableExample) => void
  exampleData: RenderableExample
}): JSX.Element {
  const handleClick = React.useCallback(
    function (): void {
      onClick(exampleData)
    },
    [exampleData, onClick]
  )

  const {
    example: { pattern, queryParams },
    preview: { label, message, color, style, namedLogo },
  } = exampleData as ExampleData
  const previewUrl = staticBadgeUrl({
    baseUrl,
    label: label || '',
    message,
    color,
    style,
    namedLogo,
  })
  const exampleUrl = badgeUrlFromPath({
    path: removeRegexpFromPattern(pattern),
    queryParams,
  })

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
  baseUrl,
  onClick,
}: {
  examples: RenderableExample[]
  baseUrl?: string
  onClick: (exampleData: RenderableExample) => void
}): JSX.Element {
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
