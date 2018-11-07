'use strict'

const BaseStaticService = require('../base-static')

module.exports = class StaticBadge extends BaseStaticService {
  static get category() {
    return 'other'
  }

  static get url() {
    return {
      format: '(?:badge|:)/?((?:[^-]|--)*?)-((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color'],
    }
  }

  handle({ label, message, color }) {
    return { label, message, color }
  }
}
