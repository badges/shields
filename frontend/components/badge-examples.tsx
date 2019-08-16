import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import { removeRegexpFromPattern } from '../lib/pattern-helpers'
import {
  ExampleSignature,
  Example as ExampleData,
} from '../lib/service-definitions'
import { Badge } from './common'
import { StyledCode } from './snippet'

interface ExampleWithoutFlag extends ExampleData {
  isBadgeSuggestion?: boolean
}

export interface SuggestionData {
  title: string
  link?: string
  example: ExampleSignature
  isBadgeSuggestion: true
}

type RenderableExampleData = ExampleWithoutFlag | SuggestionData

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
  onClick: (exampleData: RenderableExampleData) => void
  exampleData: RenderableExampleData
}) {
  const { title, example, isBadgeSuggestion } = exampleData
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
    const {
      preview: { label, message, color, style, namedLogo },
    } = exampleData as ExampleWithoutFlag
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

  function handleClick() {
    onClick(exampleData)
  }

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

export default function BadgeExamples({
  examples,
  baseUrl,
  onClick,
}: {
  examples: RenderableExampleData[]
  baseUrl?: string
  onClick: (exampleData: RenderableExampleData) => void
}) {
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
