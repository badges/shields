'use strict'

const SonarBase = require('./sonar-base')
const {
  patternBase,
  queryParamSchema,
  keywords,
  documentation,
} = require('./sonar-helpers')

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

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/fortify-security-rating`,
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonar Fortify Security Rating',
        namedParams: {
          protocol: 'http',
          host: 'sonar.petalslink.com',
          component: 'org.ow2.petals:petals-se-ase',
        },
        queryParams: {
          sonarVersion: '4.2',
        },
        staticPreview: this.render({ rating: 4 }),
        keywords,
        documentation: `
        <p>
          Note that the Fortify Security Rating badge will only work on Sonar instances that have the <a href='https://marketplace.microfocus.com/fortify/content/fortify-sonarqube-plugin'>Fortify SonarQube Plugin</a> installed.
          The badge is not available for projects analyzed on SonarCloud.io
        </p>
        ${documentation}
      `,
      },
    ]
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

  async handle({ protocol, host, component }, { sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      protocol,
      host,
      component,
      metricName: 'fortify-security-rating',
    })

    const { metricValue: rating } = this.transform({ json, sonarVersion })
    return this.constructor.render({ rating })
  }
}
