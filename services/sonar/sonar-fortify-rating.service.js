import SonarBase from './sonar-base.js'
import { queryParamSchema, keywords, documentation } from './sonar-helpers.js'

const colorMap = {
  0: 'red',
  1: 'orange',
  2: 'yellow',
  3: 'yellowgreen',
  4: 'green',
  5: 'brightgreen',
}

export default class SonarFortifyRating extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar/fortify-security-rating',
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static examples = [
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

  static defaultBadgeData = { label: 'fortify-security-rating' }

  static render({ rating }) {
    return {
      message: `${rating}/5`,
      color: colorMap[rating],
    }
  }

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'fortify-security-rating',
    })

    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({
      rating: metrics['fortify-security-rating'],
    })
  }
}
