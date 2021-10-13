import { coveragePercentage } from '../color-formatters.js'
import SonarBase from './sonar-base.js'
import { documentation, keywords, queryParamSchema } from './sonar-helpers.js'

export default class SonarCoverage extends SonarBase {
  static category = 'coverage'

  static route = {
    base: 'sonar/coverage',
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Coverage',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
        branch: 'master',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      },
      staticPreview: this.render({ coverage: 63 }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'coverage',
    })
    const { coverage } = this.transform({
      json,
      sonarVersion,
    })
    return this.constructor.render({ coverage })
  }
}
