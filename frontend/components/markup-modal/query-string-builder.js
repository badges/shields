import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import humanizeString from 'humanize-string'
import { noAutocorrect } from '../common'
import {
  BuilderContainer,
  BuilderLabel,
  BuilderInput,
  BuilderCaption,
} from './builder-common'

const QueryParamLabel = styled(BuilderLabel)`
  margin: 5px;
`

const QueryParamInput = styled(BuilderInput)`
  margin: 5px 10px;
`

const QueryParamCaption = styled(BuilderCaption)`
  margin: 5px;
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

  renderQueryParam({ name, value, isStringParam, stringParamCount }) {
    const exampleValue = this.props.exampleParams[name]
    return (
      <tr>
        <td>
          <QueryParamLabel htmlFor={name}>
            {humanizeString(name).toLowerCase()}
          </QueryParamLabel>
        </td>
        <td>
          {isStringParam && (
            <QueryParamCaption>
              {stringParamCount === 0 ? `e.g. ${exampleValue}` : exampleValue}
            </QueryParamCaption>
          )}
        </td>
        <td>
          {isStringParam ? (
            <QueryParamInput
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
    let stringParamCount = 0
    return (
      <BuilderContainer>
        <table>
          <tbody>
            {Object.entries(queryParams).map(([name, value]) => {
              const isStringParam = typeof value === 'string'
              return this.renderQueryParam({
                name,
                value,
                isStringParam,
                stringParamCount: isStringParam
                  ? stringParamCount++
                  : undefined,
              })
            })}
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
