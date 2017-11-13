import React from 'react';
import PropTypes from 'prop-types';

export default class DynamicBadgeMaker extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      type: 'json',
      label: null,
      uri: null,
      colorB: null,
      prefix: null,
      suffix: null,
      query: null,
    };
  }

  makeBadgeUri () {
    const result = new URL(`/dynamic/${this.state.type}.svg`, this.props.baseUri);
    const keys = Object.keys(this.state).filter(k => k !== 'type');
    for (const k in keys) {
      result.searchParams.set(k, this.state[k]);
    }
    return result;
  }

  handleSubmit (e) {
    e.preventDefault();
    document.location = this.makeBadgeUri();
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          className="short"
          value={this.state.type}
          readOnly
          list="dynamic-type" />
        <datalist id="dynamic-type">
          <option value="json" />
        </datalist>
        <input
          className="short"
          value={this.state.label}
          onChange={event => this.setState({ label: event.target.value })}
          placeholder="label" />
        <input
          className="short"
          value={this.state.uri}
          onChange={event => this.setState({ uri: event.target.value })}
          placeholder="uri" />
        <input
          className="short"
          value={this.state.query}
          onChange={event => this.setState({ query: event.target.value })}
          placeholder="$.data.subdata" />
        <input
          className="short"
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          placeholder="hex color" />
        <input
          className="short"
          value={this.state.prefix}
          onChange={event => this.setState({ prefix: event.target.value })}
          placeholder="prefix" />
        <input
          className="short"
          value={this.state.suffix}
          onChange={event => this.setState({ suffix: event.target.value })}
          placeholder="suffix" />
        <button>Make Badge</button>
      </form>
    );
  }
}
DynamicBadgeMaker.propTypes = {
  baseUri: PropTypes.string.isRequired,
};
