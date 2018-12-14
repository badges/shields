import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import pathToRegexp from 'path-to-regexp'
import humanizeString from 'humanize-string'
import { StyledInput, noAutocorrect } from './common'

const Column = styled.span`
  height: 58px;

  float: left;
  display: flex;
  flex-direction: column;

  margin: 5px 0;

  ${({ horizPadding }) =>
    horizPadding &&
    css`
      padding-left: ${horizPadding};
      padding-right: ${horizPadding};
    `};
`

const Literal = styled.div`
  margin-top: 20px;
  ${({ marginLeft }) =>
    marginLeft &&
    css`
      margin-left: ${marginLeft};
    `};
`

const PositionedLabel = styled.label`
  height: 20px;
  width: 100%;

  text-align: center;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const PositionedInput = styled(StyledInput)`
  width: 100%;
  text-align: center;

  margin-bottom: 10px;
`

const PositionedCaption = styled.span`
  width: 100%;
  text-align: center;

  color: #999;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const NamedParamFieldContainer = styled.div`
  display: inline-block;

  padding: 11px 14px 10px;

  border-radius: 4px;
  background: #eef;
`

export default class PathBuilder extends React.Component {
  constructor(props) {
    super(props)

    const namedParams = {}
    this.tokens
      .filter(t => typeof t !== 'string')
      .map(t => t.name)
      .forEach(name => {
        namedParams[name] = ''
      })

    this.state = { namedParams }
  }

  get tokens() {
    const { pattern } = this.props
    return pathToRegexp.parse(pattern)
  }

  handleTokenChange = event => {
    const { name, value } = event.target
    const { namedParams } = this.state
    this.setState({
      namedParams: {
        ...namedParams,
        [name]: value,
      },
    })
  }

  renderLiteral(literal, index) {
    return (
      <Column key={literal}>
        <Literal marginLeft={index === 0 ? '3px' : undefined}>
          {literal}
        </Literal>
      </Column>
    )
  }

  renderNamedParam(token, index) {
    const { delimiter, name } = token

    const { exampleParams } = this.props
    const exampleValue = exampleParams[name]

    const { namedParams } = this.state
    const value = namedParams[name]

    return (
      <>
        {this.renderLiteral(delimiter)}
        <Column key={token.name} horizPadding="8px">
          <PositionedLabel htmlFor={name}>
            {humanizeString(name)}
          </PositionedLabel>
          <PositionedInput
            type="text"
            name={name}
            value={value}
            onChange={this.handleTokenChange}
            {...noAutocorrect}
          />
          <PositionedCaption>
            {index === 0 ? `e.g. ${exampleValue}` : exampleValue}
          </PositionedCaption>
        </Column>
      </>
    )
  }

  render() {
    let namedParamIndex = 0
    return (
      <NamedParamFieldContainer>
        {this.tokens.map((token, tokenIndex) =>
          typeof token === 'string'
            ? this.renderLiteral(token, tokenIndex)
            : this.renderNamedParam(token, namedParamIndex++)
        )}
      </NamedParamFieldContainer>
    )
  }
}
PathBuilder.propTypes = {
  pattern: PropTypes.string.isRequired,
  exampleParams: PropTypes.object.isRequired,
}
