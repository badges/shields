import React from 'react';
import PropTypes from 'prop-types';
import { staticBadgeUrl } from '../lib/badge-url';

export default class StaticBadgeMaker extends React.Component {
  static propTypes = {
    baseUri: PropTypes.string,
  };

  state = {
    subject: '',
    status: '',
    color: '',
  };

  handleSubmit (e) {
    e.preventDefault();

    const { baseUri } = this.props;
    const { subject, status, color } = this.state;
    const badgeUri = staticBadgeUrl(baseUri || window.location.href, subject, status, color);

    document.location = badgeUri;
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          className="short"
          value={this.state.subject}
          onChange={event => this.setState({ subject: event.target.value })}
          placeholder="subject" /> {}
        <input
          className="short"
          value={this.state.status}
          onChange={event => this.setState({ status: event.target.value })}
          placeholder="status" /> {}
        <input
          className="short"
          value={this.state.color}
          onChange={event => this.setState({ color: event.target.value })}
          list="default-colors"
          placeholder="color" /> {}
        <datalist id="default-colors">
          <option value="brightgreen" />
          <option value="green" />
          <option value="yellowgreen" />
          <option value="yellow" />
          <option value="orange" />
          <option value="red" />
          <option value="lightgrey" />
          <option value="blue" />
        </datalist> {}
        <button>Make Badge</button>
      </form>
    );
  }
}
