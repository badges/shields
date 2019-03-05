'use strict'

const { BaseClojarsVersionService } = require('./clojars-base')

module.exports = class ClojarsVersionSnapshot extends BaseClojarsVersionService {
  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({ clojar, version: json.latest_version })
  }

  static get route() {
    return {
      base: 'clojars/vpre',
      pattern: ':clojar+',
    }
  }
}
