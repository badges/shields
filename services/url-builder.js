'use strict'

const { toArray } = require('../lib/badge-data')

/*
 * Factory class for building a BaseService `url` object. This class is useful
 * in complex collections of service classes, when the URL is built
 * conditionally.
 */
module.exports = class UrlBuilder {
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
