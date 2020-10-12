'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyLangProgress extends LocalazyBase {
  static route = this.buildRoute('lang-progress', ':localeCode')
  static examples = [
    {
      title: 'Localazy language progress with locale',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
        localeCode: 'pt_BR',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'pt_BR',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId, localeCode }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'lang-code',
      content: localeCode,
    })
    return this.constructor.render({ message, label, color })
  }
}
