'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  module_count: nonNegativeInteger,
  release_count: nonNegativeInteger,
}).required()

class BasePuppetForgeUsersService extends BaseJsonService {
  async fetch({ user }) {
    return this._requestJson({
      schema,
      url: `https://forgeapi.puppetlabs.com/v3/users/${user}`,
    })
  }

  static get category() {
    return 'other'
  }
}

class PuppetForgeReleaseCountService extends BasePuppetForgeUsersService {
  static get defaultBadgeData() {
    return { label: 'releases' }
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

  async handle({ user }) {
    const data = await this.fetch({ user })
    return this.constructor.render({ releases: data.release_count })
  }

  static render({ releases }) {
    return {
      message: metric(releases),
      color: floorCountColor(releases, 10, 50, 100),
    }
  }
}

class PuppetForgeModuleCountService extends BasePuppetForgeUsersService {
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

module.exports = {
  PuppetForgeReleaseCountService,
  PuppetForgeModuleCountService,
}
