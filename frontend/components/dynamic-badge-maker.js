import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { dynamicBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'

export default function DynamicBadgeMaker({
  baseUrl = document.location.href,
}) {
  const [values, setValues] = useState({
    datatype: '',
    label: '',
    dataUrl: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  })

  const isValid = ['datatype', 'label', 'dataUrl', 'query'].every(
    k => values[k]
  )

  const onChange = ({ target: { name, value } }) => {
    setValues({
      ...values,
      [name]: value,
    })
  }

  const onSubmit = e => {
    e.preventDefault()

    const { datatype, label, dataUrl, query, color, prefix, suffix } = values
    document.location = dynamicBadgeUrl({
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

  const inputs = [
    { name: 'label' },
    { name: 'dataUrl', placeholder: 'data url' },
    { name: 'query' },
    { name: 'color' },
    { name: 'prefix' },
    { name: 'suffix' },
  ]

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
DynamicBadgeMaker.propTypes = {
  baseUrl: PropTypes.string,
}
