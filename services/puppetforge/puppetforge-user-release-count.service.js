'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BasePuppetForgeUsersService } = require('./puppetforge-base')

module.exports = class PuppetForgeReleaseCountService extends (
  BasePuppetForgeUsersService
) {
  static category = 'other'

  static route = {
    base: 'puppetforge/rc',
    pattern: ':user',
  }

  static examples = [
    {
      title: 'Puppet Forge releases by user',
      namedParams: {
        user: 'camptocamp',
      },
      staticPreview: this.render({ releases: 1000 }),
    },
  ]

  static defaultBadgeData = { label: 'releases' }

  static render({ releases }) {
    return {
      message: metric(releases),
      color: floorCountColor(releases, 10, 50, 100),
    }
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ releases: data.release_count })
  }
}
