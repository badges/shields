'use strict'

const BaseStaticService = require('../base-static')

module.exports = class Gitter extends BaseStaticService {
  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'gitter/room',
      pattern: ':user/:repo',
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

  static get defaultBadgeData() {
    return { label: 'chat' }
  }

  static render() {
    return { message: 'on gitter', color: 'brightgreen' }
  }

  handle() {
    return this.constructor.render()
  }
}
