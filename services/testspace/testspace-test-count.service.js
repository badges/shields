import { metric as metricCount } from '../text-formatters.js'
import TestspaceBase from './testspace-base.js'

export default class TestspaceTestCount extends TestspaceBase {
  static route = {
    base: 'testspace',
    pattern:
      ':metric(total|passed|failed|skipped|errored)/:org/:project/:space+',
  }

  static examples = [
    {
      title: 'Testspace tests',
      namedParams: {
        metric: 'passed',
        org: 'swellaby',
        project: 'swellaby:testspace-sample',
        space: 'main',
      },
      staticPreview: this.render({
        metric: 'passed',
        value: 31,
      }),
    },
  ]

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
    const { passed, failed, skipped, errored, total } =
      this.transformCaseCounts(json)
    if (metric === 'total') {
      return { value: total }
    } else if (metric === 'passed') {
      return { value: passed }
    } else if (metric === 'failed') {
      return { value: failed }
    } else if (metric === 'skipped') {
      return { value: skipped }
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
