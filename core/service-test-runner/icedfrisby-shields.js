'use strict'

const Joi = require('joi')
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

    expectBadge({ label, message, color }) {
      return this.afterJSON(json => {
        expect(json.label, 'label mismatch').to.equal(label)
        if (typeof message === 'string') {
          expect(json.message, 'message mismatch').to.equal(message)
        } else {
          Joi.validate(json.message, message, err => {
            if (err) {
              throw err
            }
          })
        }
        if (typeof color !== 'undefined') {
          expect(json.color, 'color mismatch').to.equal(color)
        }
      })
    }
  }

module.exports = factory
