'use strict'

const BaseWordpress = require('./wordpress-base')

class WordpressPluginIssues extends BaseWordpress {
  static category = 'issue-tracking'

  static route = {
    base: `wordpress/plugin/issues`,
    pattern: ':variant(raw|percentage|outof)/:status(open|closed)/:slug',
  }

  static examples = [
    {
      title: 'WordPress Plugin Issues',
      pattern: 'raw/:status(open|closed)/:slug',
      namedParams: { status: 'open', slug: 'akismet' },
      staticPreview: this.render({
        status: 'open',
        variant: 'raw',
        issues: '365',
        closed_issues: '200',
      }),
    },
    {
      title: 'WordPress Plugin Issues (Percentage)',
      pattern: 'percentage/:status(open|closed)/:slug',
      namedParams: { status: 'open', slug: 'akismet' },
      staticPreview: this.render({
        status: 'open',
        variant: 'percentage',
        issues: '365',
        closed_issues: '200',
      }),
    },
    {
      title: 'WordPress Plugin Issues (OutOf)',
      pattern: 'outof/:status(open|closed)/:slug',
      namedParams: { status: 'open', slug: 'akismet' },
      staticPreview: this.render({
        status: 'open',
        variant: 'outof',
        issues: 365,
        closed_issues: 200,
      }),
    },
  ]

  static calcOpen(issues, closed_issues) {
    return issues - closed_issues
  }

  static colorCalc(closed_percentage) {
    if (closed_percentage < 50) {
      return 'red'
    } else if (closed_percentage < 90) {
      return 'yellow'
    } else {
      return 'brightgreen'
    }
  }

  static rawCalc(issues, closed_issues, status) {
    if (status === 'open') {
      return this.calcOpen(issues, closed_issues)
    } else {
      return closed_issues
    }
  }

  static percentageCalc(issues, closed_issues, status) {
    const percentClosed = Math.round((closed_issues / issues) * 100)
    if (status === 'open') {
      return 100 - percentClosed
    } else {
      return percentClosed
    }
  }

  static outOfCalc(issues, closed_issues, status) {
    if (status === 'open') {
      const open_issues = this.calcOpen(issues, closed_issues)
      return `${open_issues}/${issues}`
    } else {
      return `${closed_issues}/${issues}`
    }
  }

  static render({ status, variant, issues, closed_issues }) {
    const { label, value, color } = this.transform({
      status,
      variant,
      issues,
      closed_issues,
    })

    return {
      label,
      message: value,
      color,
    }
  }

  static transform({ status, variant, issues, closed_issues }) {
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

    return {
      label,
      value,
      color,
    }
  }

  async handle({ variant, status, slug }) {
    const json = await this.fetch({
      extensionType: 'plugin',
      slug,
    })
    const issues = json.support_threads
    const closed_issues = json.support_threads_resolved

    return this.constructor.render({
      status,
      variant,
      issues,
      closed_issues,
    })
  }
}

class WordpressPluginIssuesOpenClose extends BaseWordpress {
  static category = 'issue-tracking'

  static route = {
    base: `wordpress/plugin/issues`,
    pattern: ':opcl(opcl-min|opcl-long)/:slug',
  }

  static examples = [
    {
      title: 'WordPress Plugin issues (open/closed, short format)',
      pattern: 'opcl-min/:slug',
      namedParams: { slug: 'akismet' },
      staticPreview: this.render({
        long: false,
        issues: 300,
        closed_issues: 259,
      }),
    },
    {
      title: 'WordPress Plugin issues (open/closed, long format)',
      pattern: 'opcl-long/:slug',
      namedParams: { slug: 'akismet' },
      staticPreview: this.render({
        long: true,
        issues: 300,
        closed_issues: 259,
      }),
    },
  ]

  static calcOpen(issues, closed_issues) {
    return issues - closed_issues
  }

  static colorCalc(closed_percentage) {
    if (closed_percentage < 50) {
      return 'red'
    } else if (closed_percentage < 90) {
      return 'yellow'
    } else {
      return 'brightgreen'
    }
  }

  static percentageCalc(issues, closed_issues, status) {
    const percentClosed = Math.round((closed_issues / issues) * 100)
    if (status === 'open') {
      return 100 - percentClosed
    } else {
      return percentClosed
    }
  }

  static valueColor(long, issues, closed_issues) {
    const closed_percentage = this.percentageCalc(
      issues,
      closed_issues,
      'closed'
    )

    const color = this.colorCalc(closed_percentage)
    const open_issues = this.calcOpen(issues, closed_issues)
    let value
    if (long) {
      value = `${open_issues} open, ${closed_issues} closed`
    } else {
      value = `${open_issues}/${closed_issues}`
    }

    return {
      value,
      color,
    }
  }

  static render({ long, issues, closed_issues }) {
    let label
    const { value, color } = this.valueColor(long, issues, closed_issues)
    if (long) {
      label = 'issues'
    } else {
      label = 'open/closed'
    }
    return {
      label,
      message: value,
      color,
    }
  }

  async handle({ opcl, slug }) {
    const { support_threads, support_threads_resolved } = await this.fetch({
      extensionType: 'plugin',
      slug,
    })
    const issues = support_threads
    const closed_issues = support_threads_resolved

    let long = false
    if (opcl === 'opcl-long') {
      long = true
    }

    return this.constructor.render({
      long,
      issues,
      closed_issues,
    })
  }
}

module.exports = {
  WordpressPluginIssues,
  WordpressPluginIssuesOpenClose,
}
