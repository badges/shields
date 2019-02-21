import React from 'react'
import PropTypes from 'prop-types'
import { dynamicBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'

export default class DynamicBadgeMaker extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string,
  }

  state = {
    datatype: '',
    label: '',
    dataUrl: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  }

  makeBadgeUrl() {
    const {
      datatype,
      label,
      dataUrl,
      query,
      color,
      prefix,
      suffix,
    } = this.state
    const { baseUrl: baseUrl = document.location.href } = this.props
    return dynamicBadgeUrl({
      baseUrl: baseUrl || window.location.href,
      datatype,
      label,
      dataUrl,
      query,
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
    const { datatype, label, dataUrl, query } = this.state
    return datatype && label && dataUrl && query
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <select
          className="short"
          onChange={event => this.setState({ datatype: event.target.value })}
          value={this.state.datatype}
        >
          <option disabled value="">
            data type
          </option>
          <option value="json">json</option>
          <option value="xml">xml</option>
          <option value="yaml">yaml</option>
        </select>{' '}
        <InlineInput
          className="short"
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label"
          value={this.state.label}
        />
        <InlineInput
          className="short"
          onChange={event => this.setState({ dataUrl: event.target.value })}
          placeholder="data url"
          value={this.state.dataUrl}
        />
        <InlineInput
          className="short"
          onChange={event => this.setState({ query: event.target.value })}
          placeholder="query"
          value={this.state.query}
        />
        <InlineInput
          className="short"
          onChange={event => this.setState({ color: event.target.value })}
          placeholder="color"
          value={this.state.color}
        />
        <InlineInput
          className="short"
          onChange={event => this.setState({ prefix: event.target.value })}
          placeholder="prefix"
          value={this.state.prefix}
        />
        <InlineInput
          className="short"
          onChange={event => this.setState({ suffix: event.target.value })}
          placeholder="suffix"
          value={this.state.suffix}
        />
        <button disabled={!this.isValid}>Make Badge</button>
      </form>
    )
  }
}
