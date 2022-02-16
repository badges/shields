import React, {
  useState,
  useEffect,
  ChangeEvent,
  ChangeEventHandler,
} from 'react'
import styled from 'styled-components'
import humanizeString from 'humanize-string'
import { stringify as stringifyQueryString } from 'query-string'
import { advertisedStyles } from '../../lib/supported-features'
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

type BadgeOptionName = 'style' | 'label' | 'color' | 'logo' | 'logoColor'

interface BadgeOptionInfo {
  name: BadgeOptionName
  label?: string
  shieldsDefaultValue?: string
}

const supportedBadgeOptions = [
  { name: 'style', shieldsDefaultValue: 'flat' },
  { name: 'label', label: 'override label' },
  { name: 'color', label: 'override color' },
  { name: 'logo', label: 'named logo' },
  { name: 'logoColor', label: 'override logo color' },
] as BadgeOptionInfo[]

function getBadgeOption(name: BadgeOptionName): BadgeOptionInfo {
  const result = supportedBadgeOptions.find(opt => opt.name === name)
  if (!result) {
    throw Error(`Unknown badge option: ${name}`)
  }
  return result
}

function getQueryString({
  queryParams,
  badgeOptions,
}: {
  queryParams: Record<string, string | boolean>
  badgeOptions: Record<BadgeOptionName, string | undefined>
}): {
  queryString: string
  isComplete: boolean
} {
  // Use `string | null`, because `query-string` renders e.g.
  // `{ compact_message: null }` as `?compact_message`. This is
  // what we want for boolean params that are true (see below).
  const outQuery = {} as Record<string, string | null>
  let isComplete = true

  Object.entries(queryParams).forEach(([name, value]) => {
    // As above, there are two types of supported params: strings and
    // booleans.
    if (typeof value === 'string') {
      if (value) {
        outQuery[name] = value.trim()
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
    const { shieldsDefaultValue } = getBadgeOption(name as BadgeOptionName)
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
}: {
  name: string
  value: string | boolean
  exampleValue: string
  isStringParam: boolean
  stringParamCount?: number
  handleServiceQueryParamChange: ChangeEventHandler<HTMLInputElement>
}): JSX.Element {
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
            value={value as string}
            {...noAutocorrect}
          />
        ) : (
          <input
            checked={value as boolean}
            name={name}
            onChange={handleServiceQueryParamChange}
            type="checkbox"
          />
        )}
      </td>
    </tr>
  )
}

function BadgeOptionInput({
  name,
  value,
  handleBadgeOptionChange,
}: {
  name: BadgeOptionName
  value: string
  handleBadgeOptionChange: ChangeEventHandler<
    HTMLSelectElement | HTMLInputElement
  >
}): JSX.Element {
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

function BadgeOption({
  name,
  value,
  handleBadgeOptionChange,
}: {
  name: BadgeOptionName
  value: string
  handleBadgeOptionChange: ChangeEventHandler<HTMLInputElement>
}): JSX.Element {
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
}: {
  exampleParams: { [k: string]: string }
  initialStyle?: string
  onChange: ({
    queryString,
    isComplete,
  }: {
    queryString: string
    isComplete: boolean
  }) => void
}): JSX.Element {
  const [queryParams, setQueryParams] = useState(() =>
    // For each of the custom query params defined in `exampleParams`,
    // create empty values in `queryParams`.
    Object.entries(exampleParams)
      .filter(
        // If the example defines a value for one of the standard supported
        // options, do not duplicate the corresponding parameter.
        ([name]) => !supportedBadgeOptions.some(option => name === option.name)
      )
      .reduce((accum, [name, value]) => {
        // Custom query params are either string or boolean. Inspect the example
        // value to infer which one, and set empty values accordingly.
        // Throughout the component, these two types are supported in the same
        // manner: by inspecting this value type.
        const isStringParam = typeof value === 'string'
        accum[name] = isStringParam ? '' : true
        return accum
      }, {} as { [k: string]: string | boolean })
  )
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
    }, {} as Record<BadgeOptionName, string>)
  )

  const handleServiceQueryParamChange = React.useCallback(
    function ({
      target: { name, type: targetType, checked, value },
    }: ChangeEvent<HTMLInputElement>): void {
      const outValue = targetType === 'checkbox' ? checked : value
      setQueryParams({ ...queryParams, [name]: outValue })
    },
    [setQueryParams, queryParams]
  )

  const handleBadgeOptionChange = React.useCallback(
    function ({
      target: { name, value },
    }: ChangeEvent<HTMLInputElement>): void {
      setBadgeOptions({ ...badgeOptions, [name]: value })
    },
    [setBadgeOptions, badgeOptions]
  )

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
                name={name as BadgeOptionName}
                value={value}
              />
            ))}
          </tbody>
        </table>
      </BuilderContainer>
    </>
  )
}
