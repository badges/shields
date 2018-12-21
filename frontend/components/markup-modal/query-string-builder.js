import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import pathToRegexp from 'path-to-regexp'
import humanizeString from 'humanize-string'
import { StyledInput, noAutocorrect } from '../common'
import { BuilderContainer } from './builder-common'

const QueryStringBuilderRow = styled.span`
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

const NamedParamLabel = styled.label`
  height: 20px;
  width: 100%;

  text-align: center;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const NamedParamInput = styled(StyledInput)`
  width: 100%;
  text-align: center;

  margin-bottom: 10px;
`

const NamedParamCaption = styled.span`
  width: 100%;
  text-align: center;

  color: #999;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

export default class QueryStringBuilder extends React.Component {
  constructor(props) {
    super(props)

    const { exampleParams } = props

    const queryParams = {}
    Object.entries(exampleParams).forEach(([name, value]) => {
      const isStringParam = typeof value === 'string'
      queryParams[name] = isStringParam ? '' : true
    })

    this.state = { queryParams }
  }

  handleTokenChange = event => {
    const { name, type } = event.target
    const value =
      type === 'checkbox' ? event.target.checked : event.target.value
    const { queryParams: oldQueryParams } = this.state

    const queryParams = {
      ...oldQueryParams,
      [name]: value,
    }

    this.setState({ queryParams })

    const { onChange } = this.props
    if (onChange) {
      onChange(queryParams)
    }
  }

  renderQueryParam(name, value) {
    const exampleValue = this.props.exampleParams[name]
    const isStringParam = typeof exampleValue === 'string'
    return (
      <tr>
        <td>
          <NamedParamLabel htmlFor={name}>
            {humanizeString(name).toLowerCase()}
          </NamedParamLabel>
        </td>
        <td>
          {isStringParam && (
            <NamedParamCaption>{`e.g. ${exampleValue}`}</NamedParamCaption>
          )}
        </td>
        <td>
          {isStringParam ? (
            <NamedParamInput
              type="text"
              name={name}
              checked={value}
              onChange={this.handleTokenChange}
              {...noAutocorrect}
            />
          ) : (
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={this.handleTokenChange}
              {...noAutocorrect}
            />
          )}
        </td>
      </tr>
    )
  }

  render() {
    const { queryParams } = this.state
    return (
      <BuilderContainer>
        <table>
          <tbody>
            {Object.entries(queryParams).map(([name, value]) =>
              this.renderQueryParam(name, value)
            )}
          </tbody>
        </table>
      </BuilderContainer>
    )
  }
}
QueryStringBuilder.propTypes = {
  exampleParams: PropTypes.object.isRequired,
  onChange: PropTypes.func,
}
