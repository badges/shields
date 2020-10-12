'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyLangPogressEn extends LocalazyBase {
  static route = this.buildRoute('lang-progress-en', ':localeCode')
  static examples = [
    {
      title: 'Localazy language progress in English',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
        localeCode: 'pt_BR',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'Brazilian Portuguese',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId, localeCode }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'lang-name',
      content: localeCode,
    })
    return this.constructor.render({ message, label, color })
  }
}
