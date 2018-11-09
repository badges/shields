'use strict'

const BaseService = require('../base')

module.exports = class Time extends BaseService {
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
