import BaseCpanService from './cpan.js'

export default class CpanLicense extends BaseCpanService {
  static category = 'license'
  static route = { base: 'cpan/l', pattern: ':packageName' }

  static examples = [
    {
      title: 'CPAN',
      namedParams: { packageName: 'Config-Augeas' },
      staticPreview: this.render({ license: 'lgpl_2_1' }),
      keywords: ['perl'],
    },
  ]

  static render({ license }) {
    return {
      label: 'license',
      message: license,
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ license: data.license[0] })
  }
}
