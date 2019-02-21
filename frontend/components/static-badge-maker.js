import React from 'react'
import PropTypes from 'prop-types'
import { staticBadgeUrl } from '../lib/badge-url'
import { InlineInput } from './common'

export default class StaticBadgeMaker extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string,
  }

  state = {
    label: '',
    message: '',
    color: '',
  }

  handleSubmit(e) {
    e.preventDefault()

    const { baseUrl } = this.props
    const { label, message, color } = this.state
    const badgeUrl = staticBadgeUrl(
      baseUrl || window.location.href,
      label,
      message,
      color
    )

    document.location = badgeUrl
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <InlineInput
          value={this.state.label}
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label"
        />
        <InlineInput
          value={this.state.message}
          onChange={event => this.setState({ message: event.target.value })}
          placeholder="message"
        />
        <InlineInput
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          list="default-colors"
          placeholder="color"
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
        <button>Make Badge</button>
      </form>
    )
  }
}
