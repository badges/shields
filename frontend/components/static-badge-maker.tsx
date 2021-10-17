import React, { useState, ChangeEvent } from 'react'
import { staticBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'

type StateKey = 'label' | 'message' | 'color'
type State = Record<StateKey, string>

export default function StaticBadgeMaker({
  baseUrl = document.location.href,
}: {
  baseUrl: string
}): JSX.Element {
  const [values, setValues] = useState<State>({
    label: '',
    message: '',
    color: '',
  })

  const isValid = values.message && values.color

  const onChange = React.useCallback(
    function onChange({
      target: { name, value },
    }: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
      setValues({
        ...values,
        [name]: value,
      })
    },
    [setValues, values]
  )

  const onSubmit = React.useCallback(
    function (e: React.FormEvent): void {
      e.preventDefault()

      const { label, message, color } = values
      window.open(staticBadgeUrl({ baseUrl, label, message, color }), '_blank')
    },
    [baseUrl, values]
  )

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
