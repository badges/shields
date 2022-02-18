import Joi from 'joi'
import { BaseSvgScrapingService } from '../index.js'
import { isValidGrade, gradeColor } from './codefactor-helpers.js'

const schema = Joi.object({
  message: isValidGrade,
}).required()

export default class CodeFactorGrade extends BaseSvgScrapingService {
  static category = 'analysis'
  static route = {
    base: 'codefactor/grade',
    pattern: ':vcsType(github|bitbucket)/:user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'CodeFactor Grade',
      namedParams: {
        vcsType: 'github',
        user: 'microsoft',
        repo: 'powertoys',
        branch: 'main',
      },
      staticPreview: this.render({ grade: 'B+' }),
    },
  ]

  static defaultBadgeData = { label: 'code quality' }

  static render({ grade }) {
    return {
      message: grade,
      color: gradeColor(grade),
    }
  }

  async handle({ vcsType, user, repo, branch }) {
    const { message } = await this._requestSvg({
      schema,
      url: `https://codefactor.io/repository/${vcsType}/${user}/${repo}/badge/${
        branch || ''
      }`,
      errorMessages: { 404: 'repo or branch not found' },
    })
    return this.constructor.render({ grade: message })
  }
}
