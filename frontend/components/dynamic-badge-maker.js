import React from 'react'
import PropTypes from 'prop-types'
import { dynamicBadgeUrl } from '../lib/badge-url'
import { InlineInput } from './common'

export default class DynamicBadgeMaker extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string,
  }

  state = {
    datatype: '',
    label: '',
    url: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  }

  makeBadgeUrl() {
    const { datatype, label, url, query, color, prefix, suffix } = this.state
    const { baseUrl: baseUrl = document.location.href } = this.props
    return dynamicBadgeUrl(baseUrl, datatype, label, url, query, {
      color,
      prefix,
      suffix,
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    document.location = this.makeBadgeUrl()
  }

  get isValid() {
    const { datatype, label, url, query } = this.state
    return datatype && label && url && query
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <select
          className="short"
          value={this.state.datatype}
          onChange={event => this.setState({ datatype: event.target.value })}
        >
          <option value="" disabled>
            data type
          </option>
          <option value="json">json</option>
          <option value="xml">xml</option>
          <option value="yaml">yaml</option>
        </select>{' '}
        <InlineInput
          className="short"
          value={this.state.label}
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label"
        />
        <InlineInput
          className="short"
          value={this.state.url}
          onChange={event => this.setState({ url: event.target.value })}
          placeholder="url"
        />
        <InlineInput
          className="short"
          value={this.state.query}
          onChange={event => this.setState({ query: event.target.value })}
          placeholder="query"
        />
        <InlineInput
          className="short"
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          placeholder="color"
        />
        <InlineInput
          className="short"
          value={this.state.prefix}
          onChange={event => this.setState({ prefix: event.target.value })}
          placeholder="prefix"
        />
        <InlineInput
          className="short"
          value={this.state.suffix}
          onChange={event => this.setState({ suffix: event.target.value })}
          placeholder="suffix"
        />
        <button disabled={!this.isValid}>Make Badge</button>
      </form>
    )
  }
}
