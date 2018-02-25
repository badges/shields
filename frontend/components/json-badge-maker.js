import React from 'react';
import PropTypes from 'prop-types';
import { jsonBadgeUrl } from '../lib/badge-url';

export default class JsonBadgeMaker extends React.Component {
  static propTypes = {
    baseUri: PropTypes.string,
  };

  state = {
    url: ''
  };

  handleSubmit (e) {
    e.preventDefault();

    const { baseUri } = this.props;
    const { url } = this.state;
    const badgeUri = jsonBadgeUrl(baseUri || window.location.href, url);

    document.location = badgeUri;
  }

  render() {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <input
          className="medium"
          value={this.state.url}
          onChange={event => this.setState({ url: event.target.value })}
          placeholder="url" /> {}
        <button>Make Badge</button>
      </form>
    );
  }
}
