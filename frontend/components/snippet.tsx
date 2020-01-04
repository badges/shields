import React from 'react'
import ClickToSelect from '@mapbox/react-click-to-select'
import styled, { css } from 'styled-components'

interface CodeContainerProps {
  truncate?: boolean
}

const CodeContainer = styled.span<CodeContainerProps>`
  position: relative;

  vertical-align: middle;
  display: inline-block;

  ${({ truncate }) =>
    truncate &&
    css`
      max-width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`

export interface StyledCodeProps {
  fontSize?: string
}

export const StyledCode = styled.code<StyledCodeProps>`
  line-height: 1.2em;
  padding: 0.1em 0.3em;

  border-radius: 4px;
  background: #eef;
  font-family: Lekton;

  ${({ fontSize }) =>
    fontSize &&
    css`
      font-size: ${fontSize};
    `}

  white-space: nowrap;
`

export function Snippet({
  snippet,
  truncate = false,
  fontSize,
}: {
  snippet: string
  truncate?: boolean
  fontSize?: string
}): JSX.Element {
  return (
    <CodeContainer truncate={truncate}>
      <ClickToSelect>
        <StyledCode fontSize={fontSize}>{snippet}</StyledCode>
      </ClickToSelect>
    </CodeContainer>
  )
}
