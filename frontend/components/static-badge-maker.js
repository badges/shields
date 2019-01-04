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
          value={this.state.subject}
          onChange={event => this.setState({ subject: event.target.value })}
          placeholder="subject"
        />
        <InlineInput
          value={this.state.status}
          onChange={event => this.setState({ status: event.target.value })}
          placeholder="status"
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
