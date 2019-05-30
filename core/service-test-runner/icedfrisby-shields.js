'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')

// based on https://github.com/paulmelnikow/icedfrisby-nock/blob/master/icedfrisby-nock.js
// can be used to wrap the original "icedfrisby-nock" with additional functionality:
// - check if a request was intercepted
// - set expectations on the badge JSON response
const factory = superclass =>
  class IcedFrisbyNock extends superclass {
    constructor(message) {
      super(message)
      this.intercepted = false
    }

    intercept(setup) {
      super.intercept(setup)
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

    expectBadge({ label, message, logoWidth, labelColor, color, link }) {
      return this.afterJSON(json => {
        this.constructor._expectField(json, 'label', label)
        this.constructor._expectField(json, 'message', message)
        this.constructor._expectField(json, 'logoWidth', logoWidth)
        this.constructor._expectField(json, 'labelColor', labelColor)
        this.constructor._expectField(json, 'color', color)
        this.constructor._expectField(json, 'link', link)
      })
    }

    static _expectField(json, name, expected) {
      if (typeof expected === 'string') {
        expect(json[name], `${name} mismatch`).to.equal(expected)
      } else if (Array.isArray(expected)) {
        expect(json[name], `${name} mismatch`).to.deep.equal(expected)
      } else if (typeof expected === 'object') {
        Joi.attempt(json[name], expected, `${name} mismatch:`)
      }
    }
  }

module.exports = factory
