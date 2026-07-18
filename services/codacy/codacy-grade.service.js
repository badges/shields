import Joi from 'joi'
import { BaseSvgScrapingService, pathParams } from '../index.js'
import { codacyGrade } from './codacy-helpers.js'

const schema = Joi.object({ message: codacyGrade }).required()

export default class CodacyGrade extends BaseSvgScrapingService {
  static category = 'analysis'
  static route = { base: 'codacy/grade', pattern: ':projectId/:branch*' }

  static openApi = {
    '/codacy/grade/{projectId}': {
      get: {
        summary: 'Codacy grade',
        parameters: pathParams({
          name: 'projectId',
          example: 'b6a59cdf5ca64eab9104928d4f9bbb97',
        }),
      },
    },
    '/codacy/grade/{projectId}/{branch}': {
      get: {
        summary: 'Codacy grade (branch)',
        parameters: pathParams(
          {
            name: 'projectId',
            example: 'b6a59cdf5ca64eab9104928d4f9bbb97',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'code quality' }

  static render({ grade }) {
    const color = {
      A: 'brightgreen',
      B: 'green',
      C: 'yellowgreen',
      D: 'yellow',
      E: 'orange',
      F: 'red',
    }[grade]

    return {
      message: grade,
      color,
    }
  }

  async handle({ projectId, branch }) {
    const { message: grade } = await this._requestSvg({
      schema,
      url: `https://api.codacy.com/project/badge/grade/${encodeURIComponent(
        projectId,
      )}`,
      options: { searchParams: { branch } },
      httpErrors: { 404: 'project or branch not found' },
      valueMatcher: /visibility="hidden">([^<>]+)<\/text>/,
    })
    return this.constructor.render({ grade })
  }
}
