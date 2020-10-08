'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const keywords = [
  'l10n',
  'i18n',
  'localization',
  'internationalization',
  'translation',
]

const documentation = `Localazy translation progress`

const schema = Joi.object().required()

const queryParamSchema = Joi.object({
  content: Joi.string(),
  title: Joi.allow(
    'translated',
    'localized',
    'localization',
    'translation',
    'lang-loc-name',
    'lang-name',
    'lang-code'
  ),
  logo: Joi.boolean(),
})

module.exports = class Localazy extends BaseJsonService {
  static category = 'other'

  static get route() {
    return {
      pattern: ':projectId',
      base: 'status',
      queryParamSchema,
    }
  }

  static examples = [
    {
      title: 'Localazy overall progress translated',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        title: 'translated',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '61%, 97 langs',
        label: 'translated',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy translate progress',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'progress',
        title: 'localized',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '61%',
        label: 'localized',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy number of languages',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'langs',
        title: 'localized',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '97 langs',
        label: 'localized',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy number of languages simple',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'langs-count',
        title: 'localized',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '97',
        label: 'localized',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy progress for given language',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'pt_BR',
        title: 'localized',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'pt_BR',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy language progress with localized name',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'pt_BR',
        title: 'lang-loc-name',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'Português (BR)',
        color: '#066fef',
      }),
    },
    {
      title: 'Localazy language progress with English name',
      keywords,
      documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      queryParams: {
        content: 'pt_BR',
        title: 'lang-name',
        logo: 'false',
      },
      staticPreview: this.render({
        message: '100%',
        label: 'Brazilian Portuguese',
        color: '#066fef',
      }),
    },
  ]

  static defaultBadgeData = { label: 'localized' }

  static render(data) {
    return {
      ...data,
    }
  }

  async fetch({ projectId, title, content, logo }) {
    return this._requestJson({
      schema,
      url: `https://connect.localazy.com/status/${projectId}/data`,
      qs: {
        title,
        content,
        logo,
      },
    })
  }

  async handle({ projectId, title }, { content, logo }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title,
      content,
      logo,
    })
    return this.constructor.render({ message, label, color })
  }
}
