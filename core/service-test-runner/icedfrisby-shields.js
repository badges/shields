/**
 * @module
 */

import Joi from 'joi'
import { expect } from 'chai'

/**
 * Factory which wraps an "icedfrisby-nock" with some additional functionality:
 * - check if a request was intercepted
 * - set expectations on the badge JSON response
 *
 * @param {Function} superclass class to extend
 * @see https://github.com/paulmelnikow/icedfrisby-nock/blob/master/icedfrisby-nock.js
 * @returns {Function} wrapped class
 */
const factory = superclass =>
  class IcedFrisbyNock extends superclass {
    constructor(message) {
      super(message)
      this.intercepted = false
      super.networkOn()
    }

    get(uri, options = { followRedirect: false }) {
      if (!options.followRedirect) {
        options.followRedirect = false
      }
      super.get(uri, options)
      return this
    }

    intercept(setup) {
      super.intercept(setup)
      super.networkOff()
      this.intercepted = true
      return this
    }

    networkOff() {
      super.networkOff()
      this.intercepted = true
      return this
    }

    networkOn() {
      super.networkOn()
      this.intercepted = true
      return this
    }

    expectBadge(badge) {
      const expectedKeys = [
        'label',
        'message',
        'logoWidth',
        'labelColor',
        'color',
        'link',
      ]

      for (const key of Object.keys(badge)) {
        if (!expectedKeys.includes(key)) {
          throw new Error(`Found unexpected object key '${key}'`)
        }
      }

      return this.afterJSON(json => {
        this.constructor._expectField(json, 'label', badge.label)
        this.constructor._expectField(json, 'message', badge.message)
        this.constructor._expectField(json, 'logoWidth', badge.logoWidth)
        this.constructor._expectField(json, 'labelColor', badge.labelColor)
        this.constructor._expectField(json, 'color', badge.color)
        this.constructor._expectField(json, 'link', badge.link)
      })
    }

    expectRedirect(location) {
      return this.expectStatus(301).expectHeader('Location', location)
    }

    static _expectField(json, name, expected) {
      if (typeof expected === 'undefined') return
      if (typeof expected === 'string' || typeof expected === 'number') {
        expect(json[name], `${name} mismatch`).to.equal(expected)
      } else if (Array.isArray(expected)) {
        expect(json[name], `${name} mismatch`).to.deep.equal(expected)
      } else if (Joi.isSchema(expected)) {
        Joi.attempt(json[name], expected, `${name} mismatch:`)
      } else if (expected instanceof RegExp) {
        Joi.attempt(
          json[name],
          Joi.string().regex(expected),
          `${name} mismatch:`
        )
      } else {
        throw new Error(
          "'expected' must be a string, a number, a regex, an array or a Joi schema"
        )
      }
    }
  }

export default factory
