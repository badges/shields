import Joi from 'joi'
import { pathParam } from '../index.js'
import { renderSizeBadge, unitsQueryParam, unitsOpenApiParam } from '../size.js'
import { nonNegativeInteger } from '../validators.js'
import {
  BaseVisualStudioAppCenterService,
  description,
} from './visual-studio-app-center-base.js'

const defaultUnits = 'metric'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  units: unitsQueryParam.default(defaultUnits),
}).required()

export default class VisualStudioAppCenterReleasesSize extends BaseVisualStudioAppCenterService {
  static category = 'size'

  static route = {
    base: 'visual-studio-app-center/releases/size',
    pattern: ':owner/:app/:token',
    queryParamSchema,
  }

  static openApi = {
    '/visual-studio-app-center/releases/size/{owner}/{app}/{token}': {
      get: {
        summary: 'Visual Studio App Center Size',
        description,
        parameters: [
          pathParam({
            name: 'owner',
            example: 'jct',
          }),
          pathParam({
            name: 'app',
            example: 'my-amazing-app',
          }),
          pathParam({
            name: 'token',
            example: 'ac70cv...',
          }),
          unitsOpenApiParam(defaultUnits),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  async handle({ owner, app, token }, { units }) {
    const { size } = await this.fetch({ owner, app, token, schema })
    return renderSizeBadge(size, units)
  }
}
