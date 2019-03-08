import React from 'react'
import PropTypes from 'prop-types'
import ClickToSelect from '@mapbox/react-click-to-select'
import styled, { css } from 'styled-components'

const CodeContainer = styled.span`
  position: relative;

  vertical-align: middle;
  display: inline-block;

  ${({ truncate }) =>
    truncate &&
    css`
      max-width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
    `};
`

export const StyledCode = styled.code`
  line-height: 1.2em;
  padding: 0.1em 0.3em;

  border-radius: 4px;
  background: #eef;
  font-family: Lekton;
  font-size: ${({ fontSize }) => fontSize};

  white-space: nowrap;
`

export function Snippet({ snippet, truncate = false, fontSize }) {
  return (
    <CodeContainer truncate={truncate}>
      <ClickToSelect>
        <StyledCode fontSize={fontSize}>{snippet}</StyledCode>
      </ClickToSelect>
    </CodeContainer>
  )
}
Snippet.propTypes = {
  snippet: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  fontSize: PropTypes.string,
}
