'use strict'

class ShieldsRuntimeError extends Error {
  get name() {
    return 'ShieldsRuntimeError'
  }
  get defaultPrettyMessage() {
    throw new Error('Must implement abstract method')
  }

  constructor(props = {}, message) {
    super(message)
    this.prettyMessage = props.prettyMessage || this.defaultPrettyMessage
    if (props.underlyingError) {
      this.stack = props.underlyingError.stack
    }
  }
}

const defaultNotFoundError = 'not found'

class NotFound extends ShieldsRuntimeError {
  get name() {
    return 'NotFound'
  }
  get defaultPrettyMessage() {
    return defaultNotFoundError
  }

  constructor(props = {}) {
    const prettyMessage = props.prettyMessage || defaultNotFoundError
    const message =
      prettyMessage === defaultNotFoundError
        ? 'Not Found'
        : `Not Found: ${prettyMessage}`
    super(props, message)
    this.response = props.response
  }
}

class InvalidResponse extends ShieldsRuntimeError {
  get name() {
    return 'InvalidResponse'
  }
  get defaultPrettyMessage() {
    return 'invalid'
  }

  constructor(props = {}) {
    const message = props.underlyingError
      ? `Invalid Response: ${props.underlyingError.message}`
      : 'Invalid Response'
    super(props, message)
    this.response = props.response
  }
}

class Inaccessible extends ShieldsRuntimeError {
  get name() {
    return 'Inaccessible'
  }
  get defaultPrettyMessage() {
    return 'inaccessible'
  }

  constructor(props = {}) {
    const message = props.underlyingError
      ? `Inaccessible: ${props.underlyingError.message}`
      : 'Inaccessible'
    super(props, message)
    this.response = props.response
  }
}

class ImproperlyConfigured extends ShieldsRuntimeError {
  get name() {
    return 'ImproperlyConfigured'
  }
  get defaultPrettyMessage() {
    return 'improperly configured'
  }

  constructor(props = {}) {
    const message = props.underlyingError
      ? `ImproperlyConfigured: ${props.underlyingError.message}`
      : 'ImproperlyConfigured'
    super(props, message)
    this.response = props.response
  }
}

class InvalidParameter extends ShieldsRuntimeError {
  get name() {
    return 'InvalidParameter'
  }
  get defaultPrettyMessage() {
    return 'invalid parameter'
  }

  constructor(props = {}) {
    const message = props.underlyingError
      ? `Invalid Parameter: ${props.underlyingError.message}`
      : 'Invalid Parameter'
    super(props, message)
    this.response = props.response
  }
}

class Deprecated extends ShieldsRuntimeError {
  get name() {
    return 'Deprecated'
  }
  get defaultPrettyMessage() {
    return 'no longer available'
  }

  constructor(props) {
    const message = 'Deprecated'
    super(props, message)
  }
}

module.exports = {
  ShieldsRuntimeError,
  NotFound,
  ImproperlyConfigured,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
}
