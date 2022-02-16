import Joi from 'joi'
import { anyInteger, nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

// API doc: https://libraries.io/api#project
const projectSchema = Joi.object({
  platform: Joi.string().required(),
  dependents_count: nonNegativeInteger,
  dependent_repos_count: nonNegativeInteger,
  rank: anyInteger,
}).required()

export default class LibrariesIoBase extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    const { requestFetcher, librariesIoApiProvider } = context
    this._requestFetcher = librariesIoApiProvider.fetch.bind(
      librariesIoApiProvider,
      requestFetcher
    )
  }

  async fetchProject({ platform, scope, packageName }) {
    return this._requestJson({
      schema: projectSchema,
      url: `/${encodeURIComponent(platform)}/${
        scope ? encodeURIComponent(`${scope}/`) : ''
      }${encodeURIComponent(packageName)}`,
      errorMessages: { 404: 'package not found' },
    })
  }
}
