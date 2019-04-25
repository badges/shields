'use strict'

const { BaseClojarsVersionService } = require('./clojars-base')

module.exports = class ClojarsVersionRelease extends BaseClojarsVersionService {
  static get route() {
    return {
      base: 'clojars/v',
      pattern: ':clojar+',
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({
      clojar,
      version: json.latest_release ? json.latest_release : json.latest_version,
    })
  }
}
