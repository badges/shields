'use strict'

const BaseStaticService = require('../base-static')
const { escapeFormat } = require('../../lib/path-helpers')

module.exports = class StaticBadge extends BaseStaticService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      format: '(?::|badge/)((?:[^-]|--)*?)-?((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color'],
    }
  }

  handle({ label, message, color }) {
    return { label: escapeFormat(label), message: escapeFormat(message), color }
  }
}
