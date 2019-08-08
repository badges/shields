'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({ activity_total: nonNegativeInteger })

module.exports = class Bountysource extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'bountysource/team',
      pattern: ':team/activity',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bountysource',
        namedParams: { team: 'mozilla-core' },
        staticPreview: this.render({ total: 53000 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'bounties' }
  }

  static render({ total }) {
    return {
      message: metric(total),
      color: 'brightgreen',
    }
  }

  async fetch({ team }) {
    const url = `https://api.bountysource.com/teams/${team}`
    return this._requestJson({
      schema,
      url,
      options: {
        headers: { Accept: 'application/vnd.bountysource+json; version=2' },
      },
    })
  }

  async handle({ team }) {
    const json = await this.fetch({ team })
    return this.constructor.render({ total: json.activity_total })
  }
}
