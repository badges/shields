import React from 'react';
import PropTypes from 'prop-types';

function escapeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
}

export default class StaticBadgeMaker extends React.Component {
  makeBadgeUri () {
    let url = `${this.props.baseUri}/badge/`;
    url += escapeField(this.subjectInput.value);
    url += '-' + escapeField(this.statusInput.value);
    url += '-' + escapeField(this.colorInput.value);
    url += '.svg';
    return url;
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
          ref={input => { this.subjectInput = input; }}
          name="subject"
          placeholder="subject" />
        <input
          className="short"
          ref={input => { this.statusInput = input; }}
          name="status"
          placeholder="status" />
        <input
          className="short"
          ref={input => { this.colorInput = input; }}
          name="color"
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
StaticBadgeMaker.propTypes = {
  baseUri: PropTypes.string.isRequired,
};
