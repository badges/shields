'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  bugs: Joi.array()
    .items(
      Joi.object({
        status: Joi.string().required(),
        resolution: Joi.string().required(),
      }).required()
    )
    .min(1)
    .required(),
}).required()

const documentation = `
<p>
  If your Bugzilla badge errors, it might be because you are trying to load a private bug.
</p>
`

module.exports = class Bugzilla extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'bugzilla',
      pattern: ':protocol(http|https)?/:host?/:path*/:bugNumber',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bugzilla bug status',
        namedParams: {
          protocol: 'https',
          host: 'bugzilla.mozilla.org',
          bugNumber: '996038',
        },
        staticPreview: this.render({
          bugNumber: 996038,
          status: 'FIXED',
          resolution: '',
        }),
        documentation,
      },
      {
        title: 'Bugzilla bug status (with path)',
        namedParams: {
          protocol: 'https',
          host: 'bugs.eclipse.org',
          path: 'bugs',
          bugNumber: '545424',
        },
        staticPreview: this.render({
          bugNumber: 545424,
          status: 'RESOLVED',
          resolution: 'FIXED',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'bugzilla' }
  }

  static getDisplayStatus({ status, resolution }) {
    let displayStatus =
      status === 'RESOLVED' ? resolution.toLowerCase() : status.toLowerCase()
    if (displayStatus === 'worksforme') {
      displayStatus = 'works for me'
    }
    if (displayStatus === 'wontfix') {
      displayStatus = "won't fix"
    }
    return displayStatus
  }

  static getColor({ displayStatus }) {
    const colorMap = {
      unconfirmed: 'blue',
      new: 'blue',
      assigned: 'green',
      fixed: 'brightgreen',
      invalid: 'yellow',
      "won't fix": 'orange',
      duplicate: 'lightgrey',
      'works for me': 'yellowgreen',
      incomplete: 'red',
    }
    if (displayStatus in colorMap) {
      return colorMap[displayStatus]
    }
    return 'lightgrey'
  }

  static render({ bugNumber, status, resolution }) {
    const displayStatus = this.getDisplayStatus({ status, resolution })
    const color = this.getColor({ displayStatus })
    return {
      label: `bug ${bugNumber}`,
      message: displayStatus,
      color,
    }
  }

  async fetch({ protocol, host, path, bugNumber }) {
    const optionalPath = path ? `/${path}` : ''
    return this._requestJson({
      schema,
      url: `${protocol}://${host}${optionalPath}/rest/bug/${bugNumber}`,
    })
  }

  async handle({ protocol, host, path, bugNumber }) {
    const data = await this.fetch({ protocol, host, path, bugNumber })
    return this.constructor.render({
      bugNumber,
      status: data.bugs[0].status,
      resolution: data.bugs[0].resolution,
    })
  }
}
