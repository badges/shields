'use strict'

const SonarBase = require('./sonar-base')
const { patternBase, queryParamSchema } = require('./sonar-helpers')

const colorMap = {
  0: 'red',
  1: 'orange',
  2: 'yellow',
  3: 'yellowgreen',
  4: 'green',
  5: 'brightgreen',
}

module.exports = class SonarFortifyRating extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'fortify-security-rating' }
  }

  static render({ rating }) {
    return {
      message: `${rating}/5`,
      color: colorMap[rating],
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/fortify-security-rating`,
      queryParamSchema,
    }
  }

  async handle({ protocol, host, component }, { version }) {
    const json = await this.fetch({
      version,
      protocol,
      host,
      component,
      metricName: 'fortify-security-rating',
    })

    const { metricValue: rating } = this.transform({ json, version })
    return this.constructor.render({ rating })
  }
}
