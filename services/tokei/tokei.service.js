'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  lines: nonNegativeInteger,
}).required()

const documentation = `
<p>
  The <code>provider</code> is the domain name of git host.
  If no TLD is provided, <code>.com</code> will be added.
  For example, setting <code>gitlab</code> or <code>bitbucket.org</code> as the provider also works.
</p>
`

module.exports = class Tokei extends BaseJsonService {
  static category = 'size'

  static route = { base: 'tokei/lines', pattern: ':provider/:user/:repo' }

  static get examples() {
    return [
      {
        title: 'Lines of code',
        namedParams: {
          provider: 'github',
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: this.render({ lines: 119500 }),
        keywords: ['loc', 'tokei'],
        documentation,
      },
    ]
  }

  static defaultBadgeData = {
    label: 'total lines',
    color: 'blue',
  }

  static render({ lines }) {
    return { message: metric(lines) }
  }

  async fetch({ provider, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://tokei.rs/b1/${provider}/${user}/${repo}`,
      errorMessages: {
        400: 'repo not found',
      },
    })
  }

  async handle({ provider, user, repo }) {
    const { lines } = await this.fetch({ provider, user, repo })
    return this.constructor.render({ lines })
  }
}
