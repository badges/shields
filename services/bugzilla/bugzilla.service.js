'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.any()

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
      pattern: ':bugNumber',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bugzilla bug status',
        namedParams: { bugNumber: '996038' },
        staticPreview: this.render({
          bugNumber: 996038,
          status: 'FIXED',
          resolution: '',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'bugzilla' }
  }

  async fetch({ bugNumber }) {
    return this._requestJson({
      schema,
      url: `https://bugzilla.mozilla.org/rest/bug/${bugNumber}`,
    })
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

  async handle({ bugNumber }) {
    const data = await this.fetch({ bugNumber })
    return this.constructor.render({
      bugNumber,
      status: data.bugs[0].status,
      resolution: data.bugs[0].resolution,
    })
  }
}
