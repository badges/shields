'use strict'

const BaseStaticService = require('../base-static')

module.exports = class StaticBadge extends StaticService {
  static get category() {
    return 'other'
  }

  static get url() {
    return {
      format: '(?:badge|:)/?((?:[^-]|--)*?)-((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color'],
    }
  }

  // Note: Since `isStatic` is true, `handle()` is not `async`.
  handle({ label, message, color }) {
    return { label, message, color }
  }
}
