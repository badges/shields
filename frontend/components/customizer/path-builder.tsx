import React, { useState, useEffect, ChangeEvent } from 'react'
import styled, { css } from 'styled-components'
import { Token, Key, parse } from 'path-to-regexp'
import humanizeString from 'humanize-string'
import { patternToOptions } from '../../lib/pattern-helpers'
import { noAutocorrect, StyledInput } from '../common'
import {
  BuilderContainer,
  BuilderLabel,
  BuilderCaption,
} from './builder-common'

interface PathBuilderColumnProps {
  pathContainsOnlyLiterals: boolean
  withHorizPadding?: boolean
}

const PathBuilderColumn = styled.span<PathBuilderColumnProps>`
  height: ${({ pathContainsOnlyLiterals }) =>
    pathContainsOnlyLiterals ? '18px' : '78px'};

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

interface PathLiteralProps {
  isFirstToken: boolean
  pathContainsOnlyLiterals: boolean
}

const PathLiteral = styled.div<PathLiteralProps>`
  margin-top: ${({ pathContainsOnlyLiterals }) =>
    pathContainsOnlyLiterals ? '0px' : '39px'};
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

export function constructPath({
  tokens,
  namedParams,
}: {
  tokens: Token[]
  namedParams: { [k: string]: string }
}): { path: string; isComplete: boolean } {
  let isComplete = true
  let path = tokens
    .map(token => {
      if (typeof token === 'string') {
        return token.trim()
      } else {
        const { prefix, name, modifier } = token
        const value = namedParams[name]
        if (value) {
          return `${prefix}${value.trim()}`
        } else if (modifier === '?' || modifier === '*') {
          return ''
        } else {
          isComplete = false
          return `${prefix}:${name}`
        }
      }
    })
    .join('')
  path = encodeURI(path)
  return { path, isComplete }
}

export default function PathBuilder({
  pattern,
  exampleParams,
  onChange,
  isPrefilled,
}: {
  pattern: string
  exampleParams: { [k: string]: string }
  onChange: ({
    path,
    isComplete,
  }: {
    path: string
    isComplete: boolean
  }) => void
  isPrefilled: boolean
}): JSX.Element {
  const [tokens] = useState(() => parse(pattern))
  const [namedParams, setNamedParams] = useState(() =>
    isPrefilled
      ? exampleParams
      : // `pathToRegexp.parse()` returns a mixed array of strings for literals
        // and  objects for parameters. Filter out the literals and work with the
        // objects.
        tokens
          .filter(t => typeof t !== 'string')
          .map(t => t as Key)
          .reduce((accum, { name }) => {
            accum[name] = ''
            return accum
          }, {} as { [k: string]: string })
  )

  useEffect(() => {
    // Ensure the default style is applied right away.
    if (onChange) {
      const { path, isComplete } = constructPath({ tokens, namedParams })
      onChange({ path, isComplete })
    }
  }, [tokens, namedParams, onChange])

  const handleTokenChange = React.useCallback(
    function ({
      target: { name, value },
    }: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
      setNamedParams({
        ...namedParams,
        [name]: value,
      })
    },
    [setNamedParams, namedParams]
  )

  function renderLiteral(
    literal: string,
    tokenIndex: number,
    pathContainsOnlyLiterals: boolean
  ): JSX.Element {
    return (
      <PathBuilderColumn
        key={`${tokenIndex}-${literal}`}
        pathContainsOnlyLiterals={pathContainsOnlyLiterals}
      >
        <PathLiteral
          isFirstToken={tokenIndex === 0}
          pathContainsOnlyLiterals={pathContainsOnlyLiterals}
        >
          {literal}
        </PathLiteral>
      </PathBuilderColumn>
    )
  }

  function renderNamedParamInput(token: Key): JSX.Element {
    const { pattern } = token
    const name = `${token.name}`
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

  function renderNamedParam(
    token: Key,
    tokenIndex: number,
    namedParamIndex: number
  ): JSX.Element {
    const { prefix, modifier } = token
    const optional = modifier === '?' || modifier === '*'
    const name = `${token.name}`

    const exampleValue = exampleParams[name] || '(not set)'

    return (
      <React.Fragment key={token.name}>
        {renderLiteral(prefix, tokenIndex, false)}
        <PathBuilderColumn pathContainsOnlyLiterals={false} withHorizPadding>
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
  const pathContainsOnlyLiterals = tokens.every(
    token => typeof token === 'string'
  )
  return (
    <BuilderContainer>
      {tokens.map((token, tokenIndex) =>
        typeof token === 'string'
          ? renderLiteral(token, tokenIndex, pathContainsOnlyLiterals)
          : renderNamedParam(token, tokenIndex, namedParamIndex++)
      )}
    </BuilderContainer>
  )
}
