import React from 'react'
import PropTypes from 'prop-types'
import { staticBadgeUrl } from '../lib/badge-url'
import { InlineInput } from './common'

export default class StaticBadgeMaker extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string,
  }

  state = {
    subject: '',
    status: '',
    color: '',
  }

  handleSubmit(e) {
    e.preventDefault()

    const { baseUrl } = this.props
    const { subject, status, color } = this.state
    const badgeUrl = staticBadgeUrl(
      baseUrl || window.location.href,
      subject,
      status,
      color
    )

    document.location = badgeUrl
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <InlineInput
          onChange={event => this.setState({ subject: event.target.value })}
          placeholder="subject"
          value={this.state.subject}
        />
        <InlineInput
          onChange={event => this.setState({ status: event.target.value })}
          placeholder="status"
          value={this.state.status}
        />
        <InlineInput
          list="default-colors"
          onChange={event => this.setState({ color: event.target.value })}
          placeholder="color"
          value={this.state.color}
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
