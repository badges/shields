'use strict'

const { BaseClojarsVersionService } = require('./clojars-base')

module.exports = class ClojarsVersion extends BaseClojarsVersionService {
  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    const { version } = this.constructor.transform(json, 'version')
    return this.constructor.render({ clojar, version })
  }

  static get route() {
    return {
      base: 'clojars/v',
      pattern: ':clojar+',
    }
  }
}
