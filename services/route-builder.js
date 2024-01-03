/**
 * Common functions and utilities for tasks related to route building
 *
 * @module
 */

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
  /**
   * Creates a RouteBuilder object.
   *
   * @param {object} attrs - Refer to individual attributes
   * @param {string} attrs.base - Base URL, defaults to ''
   */
  constructor({ base = '' } = {}) {
    this.base = base

    this._formatComponents = []
    this.capture = []
  }

  /**
   * Get the format components separated by '/'
   *
   * @returns {string} Format components, for example: "format1/format2/format3"
   */
  get format() {
    return this._formatComponents.join('/')
  }

  /**
   * Saves the format and capture values in the RouteBuilder instance.
   *
   * @param {string} format - Pattern based on path-to-regex, for example: (?:(.+)\\.)?${serviceBaseUrl}
   * @param {string} capture - Value to capture
   * @returns {object} RouteBuilder instance for chaining
   */
  push(format, capture) {
    this._formatComponents = this._formatComponents.concat(toArray(format))
    this.capture = this.capture.concat(toArray(capture))
    // Return `this` for chaining.
    return this
  }

  /**
   * Returns a new object based on RouteBuilder instance containing its base, format and capture properties.
   *
   * @returns {object} Object containing base, format and capture properties of the RouteBuilder instance
   */
  toObject() {
    const { base, format, capture } = this
    return { base, format, capture }
  }
}
