'use strict'

const BaseService = require('../base')

module.exports = class Gitter extends BaseService {
  static get category() {
    return 'chat'
  }

  static get url() {
    return {
      base: 'gitter/room',
      format: '[^/]+/[^/]+',
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitter',
        pattern: ':user/:repo',
        staticExample: this.render(),
        exampleUrl: 'nwjs/nw.js',
      },
    ]
  }

  static get isStatic() {
    return true
  }

  static get defaultBadgeData() {
    return { label: 'chat' }
  }

  static render() {
    return { message: 'on gitter', color: 'brightgreen' }
  }

  // Note: Since `isStatic` is true, `handle()` is not `async`.
  handle() {
    return this.constructor.render()
  }
}
