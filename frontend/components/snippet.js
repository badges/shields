import React from 'react'
import PropTypes from 'prop-types'
import ClickToSelect from '@mapbox/react-click-to-select'
import styled, { css } from 'styled-components'
import posed from 'react-pose'
import coalesce from '../../lib/coalesce'

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

const StyledCode = styled.code`
  line-height: 1.2em;
  padding: 0.1em 0.3em;

  border-radius: 4px;
  ${({ withBackground }) =>
    withBackground !== false &&
    css`
      background: #eef;
    `} font-family: Lekton;
  font-size: ${({ fontSize }) => fontSize};

  white-space: nowrap;
`

const Snippet = ({ snippet, truncate = false, fontSize }) => (
  <CodeContainer truncate={truncate}>
    <ClickToSelect>
      <StyledCode fontSize={fontSize}>{snippet}</StyledCode>
    </ClickToSelect>
  </CodeContainer>
)
Snippet.propTypes = {
  snippet: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  fontSize: PropTypes.string,
}

const CopiedLink = posed.span({
  init: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '-10px',
  },
  copied: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '-75px',
    opacity: 0,
  },
})

export { Snippet, StyledCode }
