import React from 'react'
import PropTypes from 'prop-types'
import styled, { css, createGlobalStyle } from 'styled-components'

export const noAutocorrect = Object.freeze({
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: 'false',
})

export const nonBreakingSpace = '\u00a0'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`

export const BaseFont = styled.div`
  font-family: Lekton, sans-serif;
  color: #534;
`

export const H2 = styled.h2`
  font-style: italic;

  margin-top: 12mm;
  font-variant: small-caps;

  ::before {
    content: '☙ ';
  }

  ::after {
    content: ' ❧';
  }
`

export const H3 = styled.h3`
  font-style: italic;
`

const BadgeWrapper = styled.span`
  padding: 2px;
  height: ${({ height }) => height};
  vertical-align: middle;
  display: ${({ display }) => display};

  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `};
`

export function Badge({
  src,
  alt = '',
  display = 'inline',
  height = '20px',
  clickable = false,
  ...rest
}) {
  return (
    <BadgeWrapper clickable={clickable} display={display} height={height}>
      {src ? <img alt={alt} src={src} {...rest} /> : nonBreakingSpace}
    </BadgeWrapper>
  )
}
Badge.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  display: PropTypes.oneOf(['inline', 'block', 'inline-block']),
  height: PropTypes.string,
  clickable: PropTypes.bool,
}

export const StyledInput = styled.input`
  height: 15px;
  border: solid #b9a;
  border-width: 0 0 1px 0;
  padding: 0;

  text-align: center;

  color: #534;

  :focus {
    outline: 0;
  }
`

export const InlineInput = styled(StyledInput)`
  width: 70px;
  margin-left: 5px;
  margin-right: 5px;
`

export const BlockInput = styled(StyledInput)`
  width: 40%;
  background-color: transparent;
`

export const VerticalSpace = styled.hr`
  border: 0;
  display: block;
  height: 3mm;
`
