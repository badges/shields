'use strict';

class NotFound extends Error {
  constructor(message) {
    super(message || 'not found');
    this.name = 'NotFound';
  }
}

class InvalidResponse extends Error {
  constructor(message) {
    super(message || 'invalid');
    this.name = 'InvalidResponse';
  }
}

module.exports = {
  NotFound,
  InvalidResponse,
};
