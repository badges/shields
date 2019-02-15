import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import humanizeString from 'humanize-string'
import { stringify as stringifyQueryString } from 'query-string'
import { advertisedStyles } from '../../../supported-features.json'
import { noAutocorrect, StyledInput } from '../common'
import {
  BuilderContainer,
  BuilderLabel,
  BuilderCaption,
} from './builder-common'

const QueryParamLabel = styled(BuilderLabel)`
  margin: 5px;
`

const QueryParamInput = styled(StyledInput)`
  margin: 5px 10px;
`

const QueryParamCaption = styled(BuilderCaption)`
  margin: 5px;
`

const supportedBadgeOptions = [
  { name: 'style' },
  { name: 'label', label: 'override label' },
  { name: 'colorB', label: 'override color' },
  { name: 'logo', label: 'named logo' },
  { name: 'logoColor', label: 'override logo color' },
]

function getBadgeOption(name) {
  return supportedBadgeOptions.find(opt => opt.name === name)
}

export default class QueryStringBuilder extends React.Component {
  constructor(props) {
    super(props)

    const { exampleParams, defaultStyle } = props

    const queryParams = {}
    Object.entries(exampleParams).forEach(([name, value]) => {
      const isStringParam = typeof value === 'string'
      queryParams[name] = isStringParam ? '' : true
    })

    const badgeOptions = {}
    const defaults = { style: defaultStyle }
    supportedBadgeOptions.forEach(({ name }) => {
      badgeOptions[name] = defaults[name] || ''
    })

    this.state = { queryParams, badgeOptions }
  }

  static getQueryString({ queryParams, badgeOptions }) {
    const outQuery = {}
    let isComplete = true

    Object.entries(queryParams).forEach(([name, value]) => {
      const isStringParam = typeof value === 'string'
      if (isStringParam) {
        if (value) {
          outQuery[name] = value
        } else {
          // Omit empty string params.
          isComplete = false
        }
      } else {
        // Translate `true` to `null`, which provides an empty query param
        // like `?compact_message`. Omit `false`. Omit default values.
        if (value) {
          outQuery[name] = null
        }
      }
    })

    Object.entries(badgeOptions).forEach(([name, value]) => {
      const { defaultValue } = getBadgeOption(name)
      if (value && value !== defaultValue) {
        outQuery[name] = value
      }
    })

    const queryString = stringifyQueryString(outQuery)

    return { queryString, isComplete }
  }

  noteQueryStringChanged({ queryParams, badgeOptions }) {
    const { onChange } = this.props
    if (onChange) {
      const { queryString, isComplete } = this.constructor.getQueryString({
        queryParams,
        badgeOptions,
      })
      onChange({ queryString, isComplete })
    }
  }

  componentDidMount() {
    // Ensure the default style is applied right away.
    const { queryParams, badgeOptions } = this.state
    this.noteQueryStringChanged({ queryParams, badgeOptions })
  }

  handleServiceQueryParamChange = event => {
    const { name, type } = event.target
    const value =
      type === 'checkbox' ? event.target.checked : event.target.value
    const { queryParams: oldQueryParams, badgeOptions } = this.state

    const queryParams = {
      ...oldQueryParams,
      [name]: value,
    }

    this.setState({ queryParams })
    this.noteQueryStringChanged({ queryParams, badgeOptions })
  }

  handleBadgeOptionChange = event => {
    const { name, value } = event.target
    const { badgeOptions: oldBadgeOptions, queryParams } = this.state

    const badgeOptions = {
      ...oldBadgeOptions,
      [name]: value,
    }

    this.setState({ badgeOptions })
    this.noteQueryStringChanged({ queryParams, badgeOptions })
  }

  renderServiceQueryParam({ name, value, isStringParam, stringParamCount }) {
    const exampleValue = this.props.exampleParams[name]
    return (
      <tr key={name}>
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
              onChange={this.handleServiceQueryParamChange}
              {...noAutocorrect}
            />
          ) : (
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={this.handleServiceQueryParamChange}
            />
          )}
        </td>
      </tr>
    )
  }

  renderBadgeOptionInput(name, value) {
    if (name === 'style') {
      return (
        <select
          name="style"
          value={value}
          onChange={this.handleBadgeOptionChange}
        >
          {advertisedStyles.map(style => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      )
    } else {
      return (
        <QueryParamInput
          type="text"
          name={name}
          checked={value}
          onChange={this.handleBadgeOptionChange}
          {...noAutocorrect}
        />
      )
    }
  }

  renderBadgeOption(name, value) {
    const {
      label = humanizeString(name),
      defaultValue: hasDefaultValue,
    } = getBadgeOption(name)
    return (
      <tr key={name}>
        <td>
          <QueryParamLabel htmlFor={name}>{label}</QueryParamLabel>
        </td>
        <td>
          {!hasDefaultValue && <QueryParamCaption>optional</QueryParamCaption>}
        </td>
        <td>{this.renderBadgeOptionInput(name, value)}</td>
      </tr>
    )
  }

  render() {
    const { queryParams, badgeOptions } = this.state
    const hasQueryParams = Boolean(Object.keys(queryParams).length)
    let stringParamCount = 0
    return (
      <>
        {hasQueryParams && (
          <BuilderContainer>
            <table>
              <tbody>
                {Object.entries(queryParams).map(([name, value]) => {
                  const isStringParam = typeof value === 'string'
                  return this.renderServiceQueryParam({
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
        )}
        <BuilderContainer>
          <table>
            <tbody>
              {Object.entries(badgeOptions).map(([name, value]) =>
                this.renderBadgeOption(name, value)
              )}
            </tbody>
          </table>
        </BuilderContainer>
      </>
    )
  }
}
QueryStringBuilder.propTypes = {
  exampleParams: PropTypes.object.isRequired,
  defaultStyle: PropTypes.string,
  onChange: PropTypes.func,
}
QueryStringBuilder.defaultProps = {
  defaultStyle: 'flat',
}
