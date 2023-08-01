import Joi from 'joi'
import { BaseJsonService, InvalidParameter, redirector } from '../index.js'

const depfuSchema = Joi.object({
  text: Joi.string().required(),
  colorscheme: Joi.string().required(),
}).required()

class Depfu extends BaseJsonService {
  static category = 'dependencies'
  static route = {
    base: 'depfu/dependencies',
    pattern: ':vcsType(github|gitlab)/:project+',
  }

  static examples = [
    {
      title: 'Depfu',
      namedParams: { vcsType: 'github', project: 'depfu/example-ruby' },
      staticPreview: this.render({
        text: 'recent',
        colorscheme: 'brightgreen',
      }),
    },
  ]

  static defaultBadgeData = { label: 'dependencies' }

  static render({ text, colorscheme }) {
    return {
      message: text,
      color: colorscheme,
    }
  }

  async fetch({ vcsType, project }) {
    const separatorPosition = project.lastIndexOf('/')
    if (separatorPosition < 0) {
      throw new InvalidParameter()
    }
    const user = encodeURIComponent(project.substr(0, separatorPosition))
    const repo = project.substr(separatorPosition)
    const url = `https://depfu.com/${vcsType}/shields/${user}/${repo}`
    return this._requestJson({ url, schema: depfuSchema })
  }

  async handle({ vcsType, project }) {
    const { text, colorscheme } = await this.fetch({ vcsType, project })
    return this.constructor.render({ text, colorscheme })
  }
}

const legacyRoutes = [
  redirector({
    category: 'dependencies',
    route: { base: 'depfu', pattern: ':user/:repo' },
    transformPath: ({ user, repo }) =>
      `/depfu/dependencies/github/${user}/${repo}`,
    dateAdded: new Date('2022-01-11'),
  }),
]

export default { ...legacyRoutes, Depfu }
