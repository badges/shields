'use strict';

class ShieldsRuntimeError extends Error {

  get name() { return 'ShieldsRuntimeError'; }
  get defaultPrettyMessage() { throw new Error('Must implement abstract method'); }

  constructor(props, message) {
    props = props || {};
    super(message);
    this.prettyMessage = props.prettyMessage || this.defaultPrettyMessage;
    this.stack = props.underlyingError ? props.underlyingError.stack : '';
  }
}

class NotFound extends ShieldsRuntimeError {

  get name() { return 'NotFound'; }
  get defaultPrettyMessage() { return 'not found'; }

  constructor(props) {
    props = props || {};
    const prettyMessage = props.prettyMessage || 'not found';
    const message = prettyMessage === 'not found'
      ? 'Not Found'
      : `Not Found: ${prettyMessage}`;
    super(props, message);
  }
}

class InvalidResponse extends ShieldsRuntimeError {

  get name() { return 'InvalidResponse'; }
  get defaultPrettyMessage() { return 'invalid'; }

  constructor(props) {
    props = props || {};
    const message = props.underlyingError
      ? `Invalid Response: ${props.underlyingError.message}`
      : 'Invalid Response';
    super(props, message);
  }
}

class Inaccessible extends ShieldsRuntimeError {

  get name() { return 'Inaccessible'; }
  get defaultPrettyMessage() { return 'inaccessible'; }

  constructor(props) {
    props = props || {};
    const message = props.underlyingError
      ? `Inaccessible: ${props.underlyingError.message}`
      : 'Inaccessible';
    super(props, message);
  }
}

module.exports = {
  NotFound,
  InvalidResponse,
  Inaccessible,
};
