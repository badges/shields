'use strict'

const { BaseStaticService } = require('..')

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
        namedParams: {
          user: 'nwjs',
          repo: 'nw.js',
        },
        staticPreview: this.render(),
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
