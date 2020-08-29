'use strict'

const BaseWordpress = require('./wordpress-base')

module.exports = class WordpressPluginIssues extends BaseWordpress {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: `wordpress/plugin/issues/`,
      pattern: ':status(open|closed)/:variant(raw|percentage|outof)/:slug',
    }
  }

  static get examples() {
    return [
      {
        title: 'WordPress Plugin issues',
        namedParams: { status: 'open', variant: 'outof', slug: 'akismet' },
        staticPreview: {
          label: 'closed issues',
          message: '80/100',
          color: 'brightgreen',
        },
      },
    ]
  }

  calcOpen(issues, closed_issues) {
    return issues - closed_issues
  }

  colorCalc(closed_percentage) {
    if (closed_percentage < 50) {
      return 'red'
    } else if (closed_percentage < 90) {
      return 'yellow'
    } else {
      return 'brightgreen'
    }
  }

  rawCalc(issues, closed_issues, status) {
    if (status === 'open') {
      return this.calcOpen(issues, closed_issues)
    } else {
      return closed_issues
    }
  }

  percentageCalc(issues, closed_issues, status) {
    const percentClosed = Math.round((closed_issues / issues) * 100)
    if (status === 'open') {
      return 100 - percentClosed
    } else {
      return percentClosed
    }
  }

  outOfCalc(issues, closed_issues, status) {
    if (status === 'open') {
      const open_issues = this.calcOpen(issues, closed_issues)
      return `${open_issues}/${issues}`
    } else {
      return `${closed_issues}/${issues}`
    }
  }

  static render({ label, value, color }) {
    return {
      label,
      message: value,
      color,
    }
  }

  async handle({ status, variant, slug }) {
    const json = await this.fetch({
      extensionType: 'plugin',
      slug,
    })
    const issues = json.support_threads
    const closed_issues = json.support_threads_resolved
    const closed_percentage = this.percentageCalc(
      issues,
      closed_issues,
      'closed'
    )

    let label
    if (status === 'open') {
      label = 'open issues'
    } else if (status === 'closed') {
      label = 'closed issues'
    }

    let value
    if (variant === 'raw') {
      value = this.rawCalc(issues, closed_issues, status)
    } else if (variant === 'percentage') {
      value = `${this.percentageCalc(issues, closed_issues, status)}%`
    } else if (variant === 'outof') {
      value = this.outOfCalc(issues, closed_issues, status)
    }

    const color = this.colorCalc(closed_percentage)

    return this.constructor.render({
      label,
      value,
      color,
    })
  }
}
