import Joi from 'joi'
import { BaseSvgScrapingService, pathParams } from '../index.js'
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

  static openApi = {
    '/codefactor/grade/{vcsType}/{user}/{repo}/{branch}': {
      get: {
        summary: 'CodeFactor Grade (with branch)',
        parameters: pathParams(
          {
            name: 'vcsType',
            example: 'github',
            schema: { type: 'string', enum: this.getEnum('vcsType') },
          },
          {
            name: 'user',
            example: 'microsoft',
          },
          {
            name: 'repo',
            example: 'powertoys',
          },
          {
            name: 'branch',
            example: 'main',
          },
        ),
      },
    },
    '/codefactor/grade/{vcsType}/{user}/{repo}': {
      get: {
        summary: 'CodeFactor Grade',
        parameters: pathParams(
          {
            name: 'vcsType',
            example: 'github',
            schema: { type: 'string', enum: this.getEnum('vcsType') },
          },
          {
            name: 'user',
            example: 'microsoft',
          },
          {
            name: 'repo',
            example: 'powertoys',
          },
        ),
      },
    },
  }

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
      httpErrors: { 404: 'repo or branch not found' },
    })
    return this.constructor.render({ grade: message })
  }
}
