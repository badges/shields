'use strict'

const SonarBase = require('./sonar-base')
const { queryParamSchema, keywords, documentation } = require('./sonar-helpers')

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
      base: 'sonar/fortify-security-rating',
      pattern: ':component',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonar Fortify Security Rating',
        namedParams: {
          component: 'org.ow2.petals:petals-se-ase',
        },
        queryParams: {
          server: 'http://sonar.petalslink.com',
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

  async handle({ component }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      metricName: 'fortify-security-rating',
    })

    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({
      rating: metrics['fortify-security-rating'],
    })
  }
}
