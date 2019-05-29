'use strict'

const { NonMemoryCachingBaseService } = require('..')

const serverStartTime = new Date(new Date().toGMTString())
let bitFlip = false

module.exports = class Debug extends NonMemoryCachingBaseService {
  static get category() {
    return 'debug'
  }

  static get route() {
    return {
      base: 'debug',
      pattern: ':variant(time|starttime|flip)',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'debug',
      color: 'blue',
    }
  }

  async handle({ variant }) {
    switch (variant) {
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
      // For production cache debugging.
      case 'flip':
        bitFlip = !bitFlip
        if (bitFlip) {
          return {
            label: 'flip',
            message: 'on',
            color: 'brightgreen',
          }
        } else {
          return {
            label: 'flip',
            message: 'off',
            color: 'red',
          }
        }
    }
  }
}
