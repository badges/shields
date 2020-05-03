import React from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'

export const noAutocorrect = Object.freeze({
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellcheck: 'false',
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

interface BadgeWrapperProps {
  height: string
  display: string
  clickable: boolean
}

const BadgeWrapper = styled.span<BadgeWrapperProps>`
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

interface BadgeProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string
  alt?: string
  display?: 'inline' | 'block' | 'inline-block'
  height?: string
  clickable?: boolean
  object?: boolean
}

export function Badge({
  src,
  alt = '',
  display = 'inline',
  height = '20px',
  clickable = false,
  object = false,
  ...rest
}: BadgeProps): JSX.Element {
  return (
    <BadgeWrapper clickable={clickable} display={display} height={height}>
      {src ? (
        object ? (
          <object data={src}>alt</object>
        ) : (
          <img alt={alt} src={src} {...rest} />
        )
      ) : (
        nonBreakingSpace
      )}
    </BadgeWrapper>
  )
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
