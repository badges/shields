'use strict'

const { BasePuppetForgeModulesService } = require('./puppetforge-base')
const { NotFound } = require('..')

module.exports = class PuppetforgeModuleEndorsement extends BasePuppetForgeModulesService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'puppetforge/e',
      pattern: ':user/:moduleName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge endorsement',
        namedParams: {
          user: 'camptocamp',
          moduleName: 'openssl',
        },
        staticPreview: this.render({ endorsement: 'approved' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'endorsement' }
  }

  static render({ endorsement }) {
    let color
    if (endorsement === 'approved') {
      color = 'green'
    } else if (endorsement === 'supported') {
      color = 'brightgreen'
    } else {
      color = 'red'
    }
    return { message: endorsement, color }
  }

  async handle({ user, moduleName }) {
    const { endorsement } = await this.fetch({ user, moduleName })
    if (endorsement == null) {
      throw new NotFound({ prettyMessage: 'none' })
    }
    return this.constructor.render({ endorsement })
  }
}
