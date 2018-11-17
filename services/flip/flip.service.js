'use strict'

const NoncachingBaseService = require('../base-noncaching')

let bitFlip = false

// Production cache debugging.
module.exports = class Flip extends NoncachingBaseService {
  static get category() {
    return 'debug'
  }

  static get route() {
    return { base: 'flip', pattern: '' }
  }

  static get defaultBadgeData() {
    return { label: 'flip' }
  }

  static render({ bit }) {
    if (bit) {
      return { message: 'on', color: 'brightgreen' }
    } else {
      return { message: 'off', color: 'red' }
    }
  }

  handle() {
    bitFlip = !bitFlip
    return this.constructor.render({ bit: bitFlip })
  }
}
