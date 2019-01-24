'use strict'

// based on https://github.com/paulmelnikow/icedfrisby-nock/blob/master/icedfrisby-nock.js
// can be used to wrap the original "icedfrisby-nock" to check if request was intercepred
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
  }

module.exports = factory
