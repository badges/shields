import React, { useState, useEffect } from 'react'
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

function getQueryString({ queryParams, badgeOptions }) {
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

function ServiceQueryParam({
  name,
  value,
  exampleValue,
  isStringParam,
  stringParamCount,
  handleServiceQueryParamChange,
}) {
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
            name={name}
            onChange={handleServiceQueryParamChange}
            type="text"
            value={value}
            {...noAutocorrect}
          />
        ) : (
          <input
            checked={value}
            name={name}
            onChange={handleServiceQueryParamChange}
            type="checkbox"
          />
        )}
      </td>
    </tr>
  )
}

function BadgeOptionInput({ name, value, handleBadgeOptionChange }) {
  if (name === 'style') {
    return (
      <select name="style" onChange={handleBadgeOptionChange} value={value}>
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
        name={name}
        onChange={handleBadgeOptionChange}
        type="text"
        value={value}
        {...noAutocorrect}
      />
    )
  }
}

function BadgeOption({ name, value, handleBadgeOptionChange }) {
  const {
    label = humanizeString(name),
    shieldsDefaultValue: hasShieldsDefaultValue,
  } = getBadgeOption(name)
  return (
    <tr>
      <td>
        <QueryParamLabel htmlFor={name}>{label}</QueryParamLabel>
      </td>
      <td>
        {!hasShieldsDefaultValue && (
          <QueryParamCaption>optional</QueryParamCaption>
        )}
      </td>
      <td>
        <BadgeOptionInput
          handleBadgeOptionChange={handleBadgeOptionChange}
          name={name}
          value={value}
        />
      </td>
    </tr>
  )
}

// The UI for building the query string, which includes two kinds of settings:
// 1. Custom query params defined by the service, stored in
//    `this.state.queryParams`
// 2. The standard badge options which apply to all badges, stored in
//    `this.state.badgeOptions`
export default function QueryStringBuilder({
  exampleParams,
  initialStyle = 'flat',
  onChange,
}) {
  const [queryParams, setQueryParams] = useState(() => {
    // For each of the custom query params defined in `exampleParams`,
    // create empty values in `queryParams`.
    const result = {}
    Object.entries(exampleParams).forEach(([name, value]) => {
      // Custom query params are either string or boolean. Inspect the example
      // value to infer which one, and set empty values accordingly.
      // Throughout the component, these two types are supported in the same
      // manner: by inspecting this value type.
      const isStringParam = typeof value === 'string'
      result[name] = isStringParam ? '' : true
    })
    return result
  })
  // For each of the standard badge options, create empty values in
  // `badgeOptions`. When `initialStyle` has been provided, use it.
  const [badgeOptions, setBadgeOptions] = useState(() =>
    supportedBadgeOptions.reduce((accum, { name }) => {
      if (name === 'style') {
        accum[name] = initialStyle
      } else {
        accum[name] = ''
      }
      return accum
    }, {})
  )

  function handleServiceQueryParamChange(event) {
    const { name, type } = event.target
    const value =
      type === 'checkbox' ? event.target.checked : event.target.value
    setQueryParams({ ...queryParams, [name]: value })
  }

  function handleBadgeOptionChange(event) {
    const { name, value } = event.target
    setBadgeOptions({ ...badgeOptions, [name]: value })
  }

  useEffect(() => {
    if (onChange) {
      const { queryString, isComplete } = getQueryString({
        queryParams,
        badgeOptions,
      })
      onChange({ queryString, isComplete })
    }
  }, [onChange, queryParams, badgeOptions])

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
                return (
                  <ServiceQueryParam
                    exampleValue={exampleParams[name]}
                    handleServiceQueryParamChange={
                      handleServiceQueryParamChange
                    }
                    isStringParam={isStringParam}
                    key={name}
                    name={name}
                    stringParamCount={
                      isStringParam ? stringParamCount++ : undefined
                    }
                    value={value}
                  />
                )
              })}
            </tbody>
          </table>
        </BuilderContainer>
      )}
      <BuilderContainer>
        <table>
          <tbody>
            {Object.entries(badgeOptions).map(([name, value]) => (
              <BadgeOption
                handleBadgeOptionChange={handleBadgeOptionChange}
                key={name}
                name={name}
                value={value}
              />
            ))}
          </tbody>
        </table>
      </BuilderContainer>
    </>
  )
}
QueryStringBuilder.propTypes = {
  exampleParams: objectOfKeyValuesPropType,
  initialStyle: PropTypes.string,
  onChange: PropTypes.func,
}
