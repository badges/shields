'use strict'

const Joi = require('joi')

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

    expectBadge({ label, message, color }) {
      let expectedBadge
      if (typeof color === 'undefined') {
        expectedBadge = { name: label, value: message }
      } else {
        expectedBadge = { name: label, value: message, color }
      }

      if (typeof message === 'string') {
        return this.expectJSON(expectedBadge)
      } else {
        return this.expectJSONTypes(Joi.object().keys(expectedBadge))
      }
    }
  }

module.exports = factory
