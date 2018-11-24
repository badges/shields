'use strict'

const NonMemoryCachingBaseService = require('../base-non-memory-caching')

module.exports = class Time extends NonMemoryCachingBaseService {
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
