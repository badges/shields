'use strict'

const { BaseClojarsVersionService } = require('./clojars-base')

module.exports = class ClojarsVersionSnapshot extends BaseClojarsVersionService {
  static get route() {
    return {
      base: 'clojars/vpre',
      pattern: ':clojar+',
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({ clojar, version: json.latest_version })
  }
}
