'use strict'

const BaseService = require('../base')

module.exports = class StaticBadge extends BaseService {
  static get category() {
    return 'other'
  }

  static get url() {
    return {
      format: '(?:badge|:)/?((?:[^-]|--)*?)-((?:[^-]|--)*)-((?:[^-]|--)+)',
      capture: ['label', 'message', 'color'],
    }
  }

  static get isStatic() {
    return true
  }

  async handle({ label, message, color }) {
    return { label, message, color }
  }
}
