import React from 'react';
import PropTypes from 'prop-types';
import { dynamicJsonBadgeUrl } from '../lib/badge-url';

export default class DynamicBadgeMaker extends React.Component {
  static propTypes = {
    baseUri: PropTypes.string,
  };

  state = {
    label: '',
    url: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  };

  makeBadgeUri () {
    const { label, url, query, color, prefix, suffix } = this.state;
    const { baseUri: baseUrl = document.location.href } = this.props;
    return dynamicJsonBadgeUrl(baseUrl, label, url, query, { color, prefix, suffix });
  }

  handleSubmit(e) {
    e.preventDefault();
    document.location = this.makeBadgeUri();
  }

  get isValid() {
    const { label, url, query } = this.state;
    return label && url && query;
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          className="short"
          value={this.state.label}
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label" /> {}
        <input
          className="short"
          value={this.state.url}
          onChange={event => this.setState({ url: event.target.value })}
          placeholder="json url" /> {}
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
