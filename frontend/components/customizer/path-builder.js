import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import pathToRegexp from 'path-to-regexp'
import humanizeString from 'humanize-string'
import { objectOfKeyValuesPropType } from '../../lib/service-definitions/service-definition-prop-types'
import { patternToOptions } from '../../lib/pattern-helpers'
import { noAutocorrect, StyledInput } from '../common'
import {
  BuilderContainer,
  BuilderLabel,
  BuilderCaption,
} from './builder-common'

const PathBuilderColumn = styled.span`
  height: 78px;

  float: left;
  display: flex;
  flex-direction: column;

  margin: 0;

  ${({ withHorizPadding }) =>
    withHorizPadding &&
    css`
      padding: 0 8px;
    `};
`

const PathLiteral = styled.div`
  margin-top: 39px;
  ${({ isFirstToken }) =>
    isFirstToken &&
    css`
      margin-left: 3px;
    `};
`

const NamedParamLabelContainer = styled.span`
  display: flex;
  flex-direction: column;
  height: 37px;
  width: 100%;
  justify-content: center;
`

const inputStyling = `
  width: 100%;
  text-align: center;
`

// 2px to align with input boxes alongside.
const NamedParamInput = styled(StyledInput)`
  ${inputStyling}
  margin-top: 2px;
  margin-bottom: 10px;
`

const NamedParamSelect = styled.select`
  ${inputStyling}
  margin-bottom: 9px;
  font-size: 10px;
`

const NamedParamCaption = styled(BuilderCaption)`
  width: 100%;
  text-align: center;
`

export function constructPath({ tokens, namedParams }) {
  let isComplete = true
  const path = tokens
    .map(token => {
      if (typeof token === 'string') {
        return token
      } else {
        const { delimiter, name, optional } = token
        const value = namedParams[name]
        if (value) {
          return `${delimiter}${value}`
        } else if (optional) {
          return ''
        } else {
          isComplete = false
          return `${delimiter}:${name}`
        }
      }
    })
    .join('')
  return { path, isComplete }
}

export default function PathBuilder({
  pattern,
  exampleParams,
  onChange,
  isPrefilled,
}) {
  const [tokens] = useState(() => pathToRegexp.parse(pattern))
  const [namedParams, setNamedParams] = useState(() =>
    isPrefilled
      ? exampleParams
      : // `pathToRegexp.parse()` returns a mixed array of strings for literals
        // and  objects for parameters. Filter out the literals and work with the
        // objects.
        tokens
          .filter(t => typeof t !== 'string')
          .reduce((accum, { name }) => {
            accum[name] = ''
            return accum
          }, {})
  )

  useEffect(() => {
    // Ensure the default style is applied right away.
    if (onChange) {
      const { path, isComplete } = constructPath({ tokens, namedParams })
      onChange({ path, isComplete })
    }
  }, [tokens, namedParams, onChange])

  function handleTokenChange(evt) {
    const { name, value } = evt.target

    setNamedParams({
      ...namedParams,
      [name]: value,
    })
  }

  function renderLiteral(literal, tokenIndex) {
    return (
      <PathBuilderColumn key={`${tokenIndex}-${literal}`}>
        <PathLiteral isFirstToken={tokenIndex === 0}>{literal}</PathLiteral>
      </PathBuilderColumn>
    )
  }

  function renderNamedParamInput(token) {
    const { name, pattern } = token
    const options = patternToOptions(pattern)

    const value = namedParams[name]

    if (options) {
      return (
        <NamedParamSelect
          name={name}
          onChange={handleTokenChange}
          value={value}
        >
          <option disabled={isPrefilled} key="empty" value="">
            {' '}
          </option>
          {options.map(option => (
            <option disabled={isPrefilled} key={option} value={option}>
              {option}
            </option>
          ))}
        </NamedParamSelect>
      )
    } else {
      return (
        <NamedParamInput
          disabled={isPrefilled}
          name={name}
          onChange={handleTokenChange}
          type="text"
          value={value}
          {...noAutocorrect}
        />
      )
    }
  }

  function renderNamedParam(token, tokenIndex, namedParamIndex) {
    const { delimiter, name, optional } = token

    const exampleValue = exampleParams[name] || '(not set)'

    return (
      <React.Fragment key={token.name}>
        {renderLiteral(delimiter, tokenIndex)}
        <PathBuilderColumn withHorizPadding>
          <NamedParamLabelContainer>
            <BuilderLabel htmlFor={name}>{humanizeString(name)}</BuilderLabel>
            {optional ? <BuilderLabel>(optional)</BuilderLabel> : null}
          </NamedParamLabelContainer>
          {renderNamedParamInput(token)}
          {!isPrefilled && (
            <NamedParamCaption>
              {namedParamIndex === 0 ? `e.g. ${exampleValue}` : exampleValue}
            </NamedParamCaption>
          )}
        </PathBuilderColumn>
      </React.Fragment>
    )
  }

  let namedParamIndex = 0
  return (
    <BuilderContainer>
      {tokens.map((token, tokenIndex) =>
        typeof token === 'string'
          ? renderLiteral(token, tokenIndex)
          : renderNamedParam(token, tokenIndex, namedParamIndex++)
      )}
    </BuilderContainer>
  )
}
PathBuilder.propTypes = {
  pattern: PropTypes.string.isRequired,
  exampleParams: objectOfKeyValuesPropType,
  onChange: PropTypes.func,
  isPrefilled: PropTypes.bool,
}
