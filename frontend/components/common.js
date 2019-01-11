import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const noAutocorrect = Object.freeze({
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: 'false',
})

const nonBreakingSpace = '\u00a0'

const BaseFont = styled.div`
  font-family: Lekton, sans-serif;
  color: #534;
`

const H2 = styled.h2`
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

const H3 = styled.h3`
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

const Badge = ({
  src,
  alt = '',
  display = 'inline',
  height = '20px',
  clickable = false,
  ...rest
}) => (
  <BadgeWrapper height={height} clickable={clickable} display={display}>
    {src ? <img src={src} alt={alt} {...rest} /> : nonBreakingSpace}
  </BadgeWrapper>
)
Badge.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  display: PropTypes.oneOf(['inline', 'block', 'inline-block']),
  height: PropTypes.string,
  clickable: PropTypes.bool,
}

const StyledInput = styled.input`
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

const InlineInput = styled(StyledInput)`
  width: 70px;
  margin-left: 5px;
  margin-right: 5px;
`

const BlockInput = styled(StyledInput)`
  width: 40%;
  background-color: transparent;
`

const VerticalSpace = styled.hr`
  border: 0;
  display: block;
  height: 3mm;
`

export {
  noAutocorrect,
  nonBreakingSpace,
  BaseFont,
  H2,
  H3,
  Badge,
  StyledInput,
  InlineInput,
  BlockInput,
  VerticalSpace,
}
