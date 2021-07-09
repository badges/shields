import TestspaceBase from './testspace-base.js'

export default class TestspacePassRatio extends TestspaceBase {
  static route = {
    base: 'testspace/pass-ratio',
    pattern: ':org/:project/:space+',
  }

  static examples = [
    {
      title: 'Testspace pass ratio',
      namedParams: {
        org: 'swellaby',
        project: 'swellaby:testspace-sample',
        space: 'main',
      },
      staticPreview: this.render({
        passed: 2,
        total: 3,
      }),
    },
  ]

  static render({ passed, total }) {
    const ratio = ((passed / total) * 100).toFixed(0)

    return {
      message: `${ratio}%`,
      color: ratio === '100' ? 'success' : 'critical',
    }
  }

  transform(json) {
    const { passed, failed, errored } = this.transformCaseCounts(json)
    return { passed, total: passed + failed + errored }
  }

  async handle({ org, project, space }) {
    const json = await this.fetch({ org, project, space })
    const { passed, total } = this.transform(json)
    return this.constructor.render({ passed, total })
  }
}
