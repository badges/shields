import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  badgeUrlFromPattern,
  staticBadgeUrl,
} from '../../core/badge-urls/make-badge-url'
import {
  serviceDefinitionPropType,
  examplePropType,
} from '../lib/service-definitions/service-definition-prop-types'
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
  const { title, example, preview } = exampleData

  const { pattern, namedParams, queryParams } = example
  const exampleUrl = badgeUrlFromPattern({
    baseUrl,
    pattern,
    namedParams,
    queryParams,
  })

  let previewUrl
  if (preview) {
    const { label, message, color, style, namedLogo } = preview
    previewUrl = staticBadgeUrl({
      baseUrl,
      label,
      message,
      color,
      style,
      namedLogo,
    })
  } else {
    previewUrl = exampleUrl
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

export default function BadgeExamples({ definitions, baseUrl, onClick }) {
  const flattened = definitions.reduce((accum, current) => {
    const { examples } = current
    return accum.concat(examples)
  }, [])

  return (
    <ExampleTable>
      <tbody>
        {flattened.map(exampleData => (
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
  definitions: PropTypes.arrayOf(serviceDefinitionPropType).isRequired,
  baseUrl: PropTypes.string,
  onClick: PropTypes.func.isRequired,
}
