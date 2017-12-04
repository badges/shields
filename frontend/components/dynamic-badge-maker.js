import React from 'react';
import PropTypes from 'prop-types';
import resolveBadgeUrl from '../lib/badge-url';

export default class DynamicBadgeMaker extends React.Component {
  static propTypes = {
    baseUri: PropTypes.string,
  };

  state = {
    type: 'json',
    label: '',
    uri: '',
    color: '',
    prefix: '',
    suffix: '',
    query: '',
  };

  makeBadgeUri () {
    const { label, uri, color, query, prefix, suffix } = this.state;
    const queryParams = {
      label,
      uri,
      colorB: color,
      query,
    }
    if (prefix) {
      queryParams.prefix = prefix;
    }
    if (suffix) {
      queryParams.suffix = suffix;
    }
    return resolveBadgeUrl(
      `/dynamic/${this.state.type}.svg`,
      this.props.baseUri || document.location.href,
      { queryParams });
  }

  handleSubmit(e) {
    e.preventDefault();
    document.location = this.makeBadgeUri();
  }

  get isValid() {
    const { label, uri, query } = this.state;
    return label && uri && query;
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          className="short"
          value={this.state.type}
          readOnly
          list="dynamic-type" /> {}
        <datalist id="dynamic-type">
          <option value="json" />
        </datalist>
        <input
          className="short"
          value={this.state.label}
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label" /> {}
        <input
          className="short"
          value={this.state.uri}
          onChange={event => this.setState({ uri: event.target.value })}
          placeholder="uri" /> {}
        <input
          className="short"
          value={this.state.query}
          onChange={event => this.setState({ query: event.target.value })}
          placeholder="$.data.subdata" /> {}
        <input
          className="short"
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          placeholder="hex color" /> {}
        <input
          className="short"
          value={this.state.prefix}
          onChange={event => this.setState({ prefix: event.target.value })}
          placeholder="prefix" /> {}
        <input
          className="short"
          value={this.state.suffix}
          onChange={event => this.setState({ suffix: event.target.value })}
          placeholder="suffix" /> {}
        <button disabled={! this.isValid}>Make Badge</button>
      </form>
    );
  }
}
