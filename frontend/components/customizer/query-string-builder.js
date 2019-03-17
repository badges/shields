import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import humanizeString from 'humanize-string'
import { stringify as stringifyQueryString } from 'query-string'
import { advertisedStyles } from '../../../supported-features.json'
import { objectOfKeyValuesPropType } from '../../lib/service-definitions/service-definition-prop-types'
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
  { name: 'style', shieldsDefaultValue: 'flat' },
  { name: 'label', label: 'override label' },
  { name: 'color', label: 'override color' },
  { name: 'logo', label: 'named logo' },
  { name: 'logoColor', label: 'override logo color' },
]

function getBadgeOption(name) {
  return supportedBadgeOptions.find(opt => opt.name === name)
}

// The UI for building the query string, which includes two kinds of settings:
// 1. Custom query params defined by the service, stored in
//    `this.state.queryParams`
// 2. The standard badge options which apply to all badges, stored in
//    `this.state.badgeOptions`
export default class QueryStringBuilder extends React.Component {
  constructor(props) {
    super(props)

    const { exampleParams, initialStyle } = props

    // Create empty values in `this.state.queryParams` for each of the custom
    // query params defined in `this.props.exampleParams`.
    const queryParams = {}
    Object.entries(exampleParams).forEach(([name, value]) => {
      // Custom query params are either string or boolean. Inspect the example
      // value to infer which one, and set empty values accordingly.
      // Throughout the component, these two types are supported in the same
      // manner: by inspecting this value type.
      const isStringParam = typeof value === 'string'
      queryParams[name] = isStringParam ? '' : true
    })

    // Create empty values in `this.state.badgeOptions` for each of the
    // standard badge options. When `this.props.initialStyle` has been
    // provided, use that as the initial style.
    const badgeOptions = {}
    supportedBadgeOptions.forEach(({ name }) => {
      if (name === 'style') {
        badgeOptions[name] = initialStyle
      } else {
        badgeOptions[name] = ''
      }
    })

    this.state = { queryParams, badgeOptions }
  }

  static getQueryString({ queryParams, badgeOptions }) {
    const outQuery = {}
    let isComplete = true

    Object.entries(queryParams).forEach(([name, value]) => {
      // As above, there are two types of supported params: strings and
      // booleans.
      const isStringParam = typeof value === 'string'
      if (isStringParam) {
        if (value) {
          outQuery[name] = value
        } else {
          // Skip empty params.
          isComplete = false
        }
      } else {
        // Generate empty query params for boolean parameters by translating
        // `{ compact_message: true }` to `?compact_message`. When values are
        // false, skip the param.
        if (value) {
          outQuery[name] = null
        }
      }
    })

    Object.entries(badgeOptions).forEach(([name, value]) => {
      const { shieldsDefaultValue } = getBadgeOption(name)
      if (value && value !== shieldsDefaultValue) {
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
              checked={value}
              name={name}
              onChange={this.handleServiceQueryParamChange}
              type="text"
              {...noAutocorrect}
            />
          ) : (
            <input
              checked={value}
              name={name}
              onChange={this.handleServiceQueryParamChange}
              type="checkbox"
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
          onChange={this.handleBadgeOptionChange}
          value={value}
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
          checked={value}
          name={name}
          onChange={this.handleBadgeOptionChange}
          type="text"
          {...noAutocorrect}
        />
      )
    }
  }

  renderBadgeOption(name, value) {
    const {
      label = humanizeString(name),
      shieldsDefaultValue: hasShieldsDefaultValue,
    } = getBadgeOption(name)
    return (
      <tr key={name}>
        <td>
          <QueryParamLabel htmlFor={name}>{label}</QueryParamLabel>
        </td>
        <td>
          {!hasShieldsDefaultValue && (
            <QueryParamCaption>optional</QueryParamCaption>
          )}
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
  exampleParams: objectOfKeyValuesPropType,
  initialStyle: PropTypes.string,
  onChange: PropTypes.func,
}
QueryStringBuilder.defaultProps = {
  initialStyle: 'flat',
}
