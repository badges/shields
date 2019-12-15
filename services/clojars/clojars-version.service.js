'use strict'

const Joi = require('@hapi/joi')
const { version: versionColor } = require('../color-formatters')
const { BaseClojarsService } = require('./clojars-base')
const { redirector } = require('..')

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

class ClojarsVersionService extends BaseClojarsService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'clojars/v',
      pattern: ':clojar+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Clojars Version',
        namedParams: { clojar: 'prismic' },
        staticPreview: this.render({ clojar: 'clojar', version: '1.2' }),
      },
      {
        title: 'Clojars Version (including pre-releases)',
        namedParams: { clojar: 'prismic' },
        queryParams: { include_prereleases: null },
        staticPreview: this.render({ clojar: 'clojar', version: '1.2' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'clojars' }
  }

  static render({ clojar, version }) {
    return {
      message: `[${clojar} "${version}"]`,
      color: versionColor(version),
    }
  }

  async handle({ clojar }, queryParams) {
    const json = await this.fetch({ clojar })
    const includePrereleases = queryParams.include_prereleases !== undefined

    if (includePrereleases) {
      return this.constructor.render({ clojar, version: json.latest_version })
    }
    return this.constructor.render({
      clojar,
      version: json.latest_release ? json.latest_release : json.latest_version,
    })
  }
}

const ClojarsVersionRedirector = redirector({
  category: 'version',
  route: {
    base: 'clojars/vpre',
    pattern: ':clojar',
  },
  transformPath: ({ clojar }) => `/clojars/v/${clojar}`,
  transformQueryParams: params => ({
    include_prereleases: null,
  }),
  dateAdded: new Date('2019-12-15'),
})

module.exports = { ClojarsVersionService, ClojarsVersionRedirector }
