'use strict'

const BaseService = require('../base')
const { serverStartTime } = require('../../lib/server-config')

module.exports = class Debug extends BaseService {
  async handle({ detail }) {
    switch (detail) {
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

  // Metadata
  static get defaultBadgeData() {
    return {
      label: 'debug',
      color: 'blue',
    }
  }

  static get category() {
    return 'debug'
  }

  static get url() {
    return {
      base: 'debug',
      format: '(time|starttime)',
      capture: ['detail'],
    }
  }
}
