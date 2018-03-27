'use strict';

class NotFound extends Error {
  constructor(prettyMessage = 'not found') {
    const message = prettyMessage == 'not found'
      ? 'Not Found'
      : `Not Found: ${prettyMessage}`;
    super(message);
    this.prettyMessage = prettyMessage;
    this.name = 'NotFound';
  }
}

class InvalidResponse extends Error {
  constructor(prettyMessage = 'invalid', underlyingError) {
    const message = underlyingError
      ? `Invalid Response: ${underlyingError.message}`
      : 'Invalid Response';
    super(message);
    this.stack = underlyingError.stack;
    this.prettyMessage = prettyMessage;
    this.name = 'InvalidResponse';
  }
}

class Inaccessible extends Error {
  constructor(underlyingError, prettyMessage = 'inaccessible') {
    super(`Inaccessible: ${underlyingError.message}`);
    this.stack = underlyingError.stack;
    this.prettyMessage = prettyMessage;
    this.name = 'Inaccessible';
  }
}

module.exports = {
  NotFound,
  InvalidResponse,
  Inaccessible,
};
