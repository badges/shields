'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyLangProgressLoc extends LocalazyBase {
  static route = this.buildRoute('lang-progress-loc', ':localeCode')
  static examples = [
    {
      title: 'Localazy language progress with local name',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
        localeCode: 'pt_BR',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'Português (BR)',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId, localeCode }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'lang-loc-name',
      content: localeCode,
    })
    return this.constructor.render({ message, label, color })
  }
}
