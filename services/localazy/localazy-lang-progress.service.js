'use strict'

const Joi = require('joi')
const LocalazyBase = require('./localazy-base.service')

const queryParamSchema = Joi.object({
  locale_display: Joi.string().allow('loc', 'en').optional(),
})

module.exports = class LocalazyLangProgress extends LocalazyBase {
  static route = this.buildRoute(
    'lang-progress',
    ':localeCode',
    queryParamSchema
  )

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
      queryParams: {
        locale_display: 'en',
      },
    },
    {
      title: 'Localazy language progress with localized name',
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
      queryParams: {
        locale_display: 'loc',
      },
    },
  ]

  static resolveTitleType(display = '') {
    if (display === 'en') {
      return 'lang-name'
    }
    if (display === 'loc') {
      return 'lang-loc-name'
    }
    return 'lang-code'
  }

  async handle({ projectId, localeCode }, { locale_display }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: this.constructor.resolveTitleType(locale_display),
      content: localeCode,
    })
    return this.constructor.render({ message, label, color })
  }
}
