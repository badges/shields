'use strict'

const NoncachingBaseService = require('../base-noncaching')

module.exports = class Time extends NoncachingBaseService {
  async handle() {
    return { message: new Date() }
  }

  // Metadata
  static get defaultBadgeData() {
    return {
      label: 'time',
      color: 'blue',
    }
  }

  static get category() {
    return 'debug'
  }

  static get route() {
    return {
      base: 'servertime',
      pattern: '',
    }
  }
}
