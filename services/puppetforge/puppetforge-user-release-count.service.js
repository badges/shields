'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { BasePuppetForgeUsersService } = require('./puppetforge-base')

module.exports = class PuppetForgeReleaseCountService extends BasePuppetForgeUsersService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'puppetforge/rc',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Puppet Forge releases by user',
        namedParams: {
          user: 'camptocamp',
        },
        staticPreview: this.render({ releases: 1000 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'releases' }
  }

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
