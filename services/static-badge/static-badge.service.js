'use strict'

const { BaseStaticService } = require('..')
const { escapeFormat } = require('../../core/badge-urls/path-helpers')

module.exports = class StaticBadge extends BaseStaticService {
  static get category() {
    return 'static'
  }

  static get route() {
    return {
      base: '',
      format: '(?::|badge/)((?:[^-]|--)*?)-?((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color'],
    }
  }

  handle({ label, message, color }) {
    return { label: escapeFormat(label), message: escapeFormat(message), color }
  }
}
