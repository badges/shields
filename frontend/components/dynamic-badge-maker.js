import React from 'react';
import PropTypes from 'prop-types';

function escapeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
}

export default class DynamicBadgeMaker extends React.Component {
  makeBadgeUri () {
    let url = this.props.baseUri;
    url += '/dynamic/' + escapeField(this.typeInput.value);
    url += '.svg?label=' + escapeField(this.labelInput.value);
    url += '&colorB=' + escapeField(this.colorInput.value);
    url += '&prefix=' + escapeField(this.prefixInput.value);
    url += '&suffix=' + escapeField(this.suffixInput.value);
    url += '&query=' + this.queryInput.value;
    url += '&uri=' + escapeField(this.uriInput.value);
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
          ref={input => { this.typeInput = input; }}
          name="type"
          list="dynamic-type"
          placeholder="type" />
        <datalist id="dynamic-type">
          <option value="json" />
        </datalist>
        <input
          className="short"
          ref={input => { this.labelInput = input; }}
          name="label"
          placeholder="label" />
        <input
          className="short"
          ref={input => { this.uriInput = input; }}
          name="uri"
          placeholder="uri" />
        <input
          className="short"
          ref={input => { this.queryInput = input; }}
          name="query"
          placeholder="$.data.subdata" />
        <input
          className="short"
          ref={input => { this.colorInput = input; }}
          name="color"
          placeholder="hex color" />
        <input
          className="short"
          ref={input => { this.prefixInput = input; }}
          name="prefix"
          placeholder="prefix" />
        <input
          className="short"
          ref={input => { this.suffixInput = input; }}
          name="suffix"
          placeholder="suffix" />
        <button>Make Badge</button>
      </form>
    );
  }
}
DynamicBadgeMaker.propTypes = {
  baseUri: PropTypes.string.isRequired,
};
