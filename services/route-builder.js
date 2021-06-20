import toArray from '../core/base-service/to-array.js'

/*
 * Factory class for building a BaseService `route` object. This class is useful
 * in complex collections of service classes, when the URL is built
 * conditionally.
 *
 * Patterns based on path-to-regex may obviate the need for this, though they
 * haven't done so yet.
 */
export default class RouteBuilder {
  constructor({ base = '' } = {}) {
    this.base = base

    this._formatComponents = []
    this.capture = []
  }

  get format() {
    return this._formatComponents.join('/')
  }

  push(format, capture) {
    this._formatComponents = this._formatComponents.concat(toArray(format))
    this.capture = this.capture.concat(toArray(capture))
    // Return `this` for chaining.
    return this
  }

  toObject() {
    const { base, format, capture } = this
    return { base, format, capture }
  }
}
