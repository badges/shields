import React, { useState, ChangeEvent } from 'react'
import { dynamicBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'

type StateKey =
  | 'datatype'
  | 'label'
  | 'dataUrl'
  | 'query'
  | 'color'
  | 'prefix'
  | 'suffix'
type State = Record<StateKey, string>

interface InputDef {
  name: StateKey
  placeholder?: string
}

const inputs = [
  { name: 'label' },
  { name: 'dataUrl', placeholder: 'data url' },
  { name: 'query' },
  { name: 'color' },
  { name: 'prefix' },
  { name: 'suffix' },
] as InputDef[]

export default function DynamicBadgeMaker({
  baseUrl = document.location.href,
}) {
  const [values, setValues] = useState<State>({
    datatype: '',
    label: '',
    dataUrl: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  })

  const isValid =
    values.datatype && values.label && values.dataUrl && values.query

  function onChange({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValues({
      ...values,
      [name]: value,
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { datatype, label, dataUrl, query, color, prefix, suffix } = values
    window.location.href = dynamicBadgeUrl({
      baseUrl,
      datatype,
      label,
      dataUrl,
      query,
      color,
      prefix,
      suffix,
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <select name="datatype" onChange={onChange} value={values.datatype}>
        <option disabled value="">
          data type
        </option>
        <option value="json">json</option>
        <option value="xml">xml</option>
        <option value="yaml">yaml</option>
      </select>{' '}
      {inputs.map(({ name, placeholder = name }) => (
        <InlineInput
          key={name}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          value={values[name]}
        />
      ))}
      <button disabled={!isValid}>Make Badge</button>
    </form>
  )
}
