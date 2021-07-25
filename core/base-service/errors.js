/**
 * Standard exceptions for handling error cases
 *
 * @module
 */

/**
 * Base error class
 *
 * @abstract
 */
class ShieldsRuntimeError extends Error {
  /**
   * Name of the class. Implementations of ShieldsRuntimeError
   * should override this method.
   *
   * @type {string}
   */
  get name() {
    return 'ShieldsRuntimeError'
  }

  /**
   * Default message for this exception if none is specified.
   * Implementations of ShieldsRuntimeError should implement this method.
   *
   * @abstract
   * @type {string}
   */
  get defaultPrettyMessage() {
    throw new Error('Must implement abstract method')
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   * @param {string} message Exception message for debug purposes
   */
  constructor(props = {}, message) {
    super(message)
    this.prettyMessage = props.prettyMessage || this.defaultPrettyMessage
    if (props.underlyingError) {
      this.stack = props.underlyingError.stack
    }
  }
}

const defaultNotFoundError = 'not found'

/**
 * Throw this to wrap a 404 or other 'not found' response from an upstream API
 */
class NotFound extends ShieldsRuntimeError {
  get name() {
    return 'NotFound'
  }

  get defaultPrettyMessage() {
    return defaultNotFoundError
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
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

/**
 * Throw this to wrap an invalid or unexpected response from an upstream API
 */
class InvalidResponse extends ShieldsRuntimeError {
  get name() {
    return 'InvalidResponse'
  }

  get defaultPrettyMessage() {
    return 'invalid'
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
  constructor(props = {}) {
    const message = props.underlyingError
      ? `Invalid Response: ${props.underlyingError.message}`
      : 'Invalid Response'
    super(props, message)
    this.response = props.response
  }
}

/**
 * Throw this if we can't contact an upstream API
 * or to wrap a 5XX response
 */
class Inaccessible extends ShieldsRuntimeError {
  get name() {
    return 'Inaccessible'
  }

  get defaultPrettyMessage() {
    return 'inaccessible'
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
  constructor(props = {}) {
    const message = props.underlyingError
      ? `Inaccessible: ${props.underlyingError.message}`
      : 'Inaccessible'
    super(props, message)
    this.response = props.response
  }
}

/**
 * Throw this error when required credentials are missing
 */
class ImproperlyConfigured extends ShieldsRuntimeError {
  get name() {
    return 'ImproperlyConfigured'
  }

  get defaultPrettyMessage() {
    return 'improperly configured'
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
  constructor(props = {}) {
    const message = props.underlyingError
      ? `ImproperlyConfigured: ${props.underlyingError.message}`
      : 'ImproperlyConfigured'
    super(props, message)
    this.response = props.response
  }
}

/**
 * Throw this error when a user supplied input or parameter
 * is invalid or unexpected
 */
class InvalidParameter extends ShieldsRuntimeError {
  get name() {
    return 'InvalidParameter'
  }

  get defaultPrettyMessage() {
    return 'invalid parameter'
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
  constructor(props = {}) {
    const message = props.underlyingError
      ? `Invalid Parameter: ${props.underlyingError.message}`
      : 'Invalid Parameter'
    super(props, message)
    this.response = props.response
  }
}

/**
 * Throw this error to indicate that a service is deprecated or removed
 */
class Deprecated extends ShieldsRuntimeError {
  get name() {
    return 'Deprecated'
  }

  get defaultPrettyMessage() {
    return 'no longer available'
  }

  /**
   * @param {module:core/base-service/errors~RuntimeErrorProps} props
   * Refer to individual attrs
   */
  constructor(props) {
    const message = 'Deprecated'
    super(props, message)
  }
}

/**
 * @typedef {object} RuntimeErrorProps
 * @property {Error} underlyingError Exception we are wrapping (Optional)
 * @property {object} response Response from an upstream API to provide
 * context for the error (Optional)
 * @property {string} prettyMessage User-facing error message to override the
 * value of `defaultPrettyMessage()`. This is the text that will appear on the
 * badge when we catch and render the exception (Optional)
 */

export {
  ShieldsRuntimeError,
  NotFound,
  ImproperlyConfigured,
  InvalidResponse,
  Inaccessible,
  InvalidParameter,
  Deprecated,
}
