// Promotes the `security_rating` metric out of the generic Sonar service
// into a first-class badge with more context (letter grade and colour).
// See https://github.com/badges/shields/issues/3236 for more information.

import { pathParam } from '../index.js'
import SonarBase from './sonar-base.js'
import {
  queryParamSchema,
  openApiQueryParams,
  documentation,
} from './sonar-helpers.js'

// Sonar's security_rating is a number from 1 to 5, where 1 = A (best)
// and 5 = E (worst).
const letterMap = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
}
const colorMap = {
  1: 'brightgreen',
  2: 'green',
  3: 'yellow',
  4: 'orange',
  5: 'red',
}

const description = `
The Sonar Security Rating badge displays a letter grade (A - E) derived from the
security_rating metric, where 1 = A (best) and 5 = E (worst).

${documentation}
`

export default class SonarSecurityRating extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar/security-rating',
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/security-rating/{component}': {
      get: {
        summary: 'Sonar Security Rating',
        description,
        parameters: [
          pathParam({ name: 'component', example: 'gitify-app_gitify' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/security-rating/{component}/{branch}': {
      get: {
        summary: 'Sonar Security Rating (branch)',
        description,
        parameters: [
          pathParam({ name: 'component', example: 'gitify-app_gitify' }),
          pathParam({ name: 'branch', example: 'main' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'security rating' }

  static render({ rating }) {
    const rounded = Math.round(rating)
    if (!Number.isInteger(rounded) || rounded < 1 || rounded > 5) {
      return {
        message: 'unknown',
        color: 'lightgrey',
      }
    }
    return {
      message: letterMap[rounded],
      color: colorMap[rounded],
    }
  }

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'security_rating',
    })

    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({
      rating: metrics['security_rating'],
    })
  }
}
