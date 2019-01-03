'use strict'

const BaseCondaService = require('./conda-base')

module.exports = class CondaPlatform extends BaseCondaService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'conda',
      pattern: ':which(p|pn)/:channel/:pkg',
    }
  }

  static get examples() {
    return [
      {
        title: 'Conda',
        namedParams: { channel: 'conda-forge', package: 'python' },
        pattern: 'pn/:channel/:package',
        staticExample: this.render({
          which: 'pn',
          platforms: ['linux-64', 'win-32', 'osx-64', 'win-64'],
        }),
      },
    ]
  }

  static render({ which, platforms }) {
    return {
      label: which === 'pn' ? 'platform' : 'conda|platform',
      message: platforms.join(' | '),
    }
  }

  async handle({ which, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({ which, platforms: json.conda_platforms })
  }
}
