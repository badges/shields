'use strict'

const BaseService = require('../base')
const { serverStartTime } = require('../../server')

module.exports = class Time extends BaseService {
  async handle({detail}) {
    switch (detail){
      case 'time':
        return { label: 'time', message: new Date() }
        break
      case 'starttime':
        return { label: 'start time', message: new Date(serverStartTime) }
        break
    }
  }

  // Metadata
  static get defaultBadgeData() {
    return {
      label: 'server',
      color: 'blue',
    }
  }

  static get category() {
    return 'debug'
  }

  static get url() {
    return {
      base: 'server',
      format: '(time|starttime)',
      capture: ['detail'],
    }
  }
}
