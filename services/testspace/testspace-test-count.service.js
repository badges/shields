import { pathParams } from '../index.js'
import { metric as metricCount } from '../text-formatters.js'
import TestspaceBase from './testspace-base.js'

export default class TestspaceTestCount extends TestspaceBase {
  static route = {
    base: 'testspace',
    pattern:
      ':metric(total|passed|failed|skipped|errored|untested)/:org/:project/:space+',
  }

  static openApi = {
    '/testspace/{metric}/{org}/{project}/{space}': {
      get: {
        summary: 'Testspace tests count',
        parameters: pathParams(
          {
            name: 'metric',
            example: 'passed',
            schema: { type: 'string', enum: this.getEnum('metric') },
          },
          {
            name: 'org',
            example: 'swellaby',
          },
          {
            name: 'project',
            example: 'swellaby:testspace-sample',
          },
          {
            name: 'space',
            example: 'main',
          },
        ),
      },
    },
  }

  static render({ value, metric }) {
    let color = 'informational'

    if (metric === 'failed' || metric === 'errored') {
      color = value === 0 ? 'success' : 'critical'
    }

    return {
      label: `${metric} tests`,
      message: metricCount(value),
      color,
    }
  }

  transform({ json, metric }) {
    const { passed, failed, skipped, errored, untested, total } =
      this.transformCaseCounts(json)
    if (metric === 'total') {
      return { value: total }
    } else if (metric === 'passed') {
      return { value: passed }
    } else if (metric === 'failed') {
      return { value: failed }
    } else if (metric === 'skipped') {
      return { value: skipped }
    } else if (metric === 'untested') {
      return { value: untested }
    } else {
      return { value: errored }
    }
  }

  async handle({ metric, org, project, space }) {
    const json = await this.fetch({ org, project, space })
    const { value } = this.transform({ json, metric })
    return this.constructor.render({ value, metric })
  }
}
