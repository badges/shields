import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { staticBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'

export default function StaticBadgeMaker({ baseUrl = document.location.href }) {
  const [values, setValues] = useState({
    label: '',
    message: '',
    color: '',
  })

  const isValid = ['message', 'color'].every(k => values[k])

  const onChange = ({ target: { name, value } }) => {
    setValues({
      ...values,
      [name]: value,
    })
  }

  const onSubmit = e => {
    e.preventDefault()

    const { label, message, color } = values
    document.location = staticBadgeUrl({ baseUrl, label, message, color })
  }

  return (
    <form onSubmit={onSubmit}>
      <InlineInput
        name="label"
        onChange={onChange}
        placeholder="label"
        value={values.label}
      />
      <InlineInput
        name="message"
        onChange={onChange}
        placeholder="message"
        value={values.message}
      />
      <InlineInput
        list="default-colors"
        name="color"
        onChange={onChange}
        placeholder="color"
        value={values.color}
      />
      <datalist id="default-colors">
        <option value="brightgreen" />
        <option value="green" />
        <option value="yellowgreen" />
        <option value="yellow" />
        <option value="orange" />
        <option value="red" />
        <option value="lightgrey" />
        <option value="blue" />
      </datalist>
      <button disabled={!isValid}>Make Badge</button>
    </form>
  )
}
StaticBadgeMaker.propTypes = {
  baseUrl: PropTypes.string,
}
