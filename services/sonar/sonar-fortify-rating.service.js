import { pathParam } from '../index.js'
import SonarBase from './sonar-base.js'
import {
  queryParamSchema,
  openApiQueryParams,
  documentation,
} from './sonar-helpers.js'

const colorMap = {
  0: 'red',
  1: 'orange',
  2: 'yellow',
  3: 'yellowgreen',
  4: 'green',
  5: 'brightgreen',
}

const description = `
Note that the Fortify Security Rating badge will only work on Sonar instances that have the <a href='https://marketplace.microfocus.com/fortify/content/fortify-sonarqube-plugin'>Fortify SonarQube Plugin</a> installed.
The badge is not available for projects analyzed on SonarCloud.io

${documentation}
`

export default class SonarFortifyRating extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar/fortify-security-rating',
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/fortify-security-rating/{component}': {
      get: {
        summary: 'Sonar Fortify Security Rating',
        description,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/fortify-security-rating/{component}/{branch}': {
      get: {
        summary: 'Sonar Fortify Security Rating (branch)',
        description,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

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
