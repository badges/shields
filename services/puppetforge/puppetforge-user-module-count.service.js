'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BasePuppetForgeUsersService } = require('./puppetforge-base')

module.exports = class PuppetForgeModuleCountService extends BasePuppetForgeUsersService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'modules' }
  }

  static get route() {
    return {
      base: 'puppetforge/mc',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge modules by user',
        namedParams: {
          user: 'camptocamp',
        },
        staticPreview: this.render({ modules: 60 }),
      },
    ]
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ modules: data.module_count })
  }

  static render({ modules }) {
    return {
      message: metric(modules),
      color: floorCountColor(modules, 5, 10, 50),
    }
  }
}
