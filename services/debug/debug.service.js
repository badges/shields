'use strict'

const NonMemoryCachingBaseService = require('../base-non-memory-caching')

const serverStartTime = new Date(new Date().toGMTString())

module.exports = class Debug extends NonMemoryCachingBaseService {
  static get category() {
    return 'debug'
  }

  static get defaultBadgeData() {
    return {
      label: 'debug',
      color: 'blue',
    }
  }

  static get route() {
    return {
      base: 'debug',
      pattern: ':which(time|starttime)',
    }
  }

  async handle({ which }) {
    switch (which) {
      case 'time':
        return {
          label: 'time',
          message: new Date().toUTCString(),
        }
      case 'starttime':
        return {
          label: 'start time',
          message: new Date(serverStartTime).toUTCString(),
        }
    }
  }
}
