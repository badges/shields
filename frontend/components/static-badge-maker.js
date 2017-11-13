import React from 'react';
import PropTypes from 'prop-types';

export default class StaticBadgeMaker extends React.Component {
  propTypes = {
    baseUri: PropTypes.string.isRequired,
  };

  state = {
    subject: null,
    status: null,
    color: null,
  };

  static escapeField(s) {
    return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
  }

  makeBadgeUri () {
    const { subject, status, color } = this.state;
    const path = [subject, status, color]
      .map(this.constructor.escapeField)
      .join('-');
    return `${this.props.baseUri}/badge/${path}.svg`;
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
          value={this.state.subject}
          onChange={event => this.setState({ subject: event.target.value })}
          placeholder="subject" />
        <input
          className="short"
          value={this.state.status}
          onChange={event => this.setState({ status: event.target.value })}
          placeholder="status" />
        <input
          className="short"
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          list="default-colors"
          placeholder="color" />
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
    );
  }
}
