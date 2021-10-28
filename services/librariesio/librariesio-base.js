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

function createRequestFetcher(context, config) {
  const { sendAndCacheRequest, librariesIoApiProvider } = context

  return async (url, options) =>
    await librariesIoApiProvider.fetch(sendAndCacheRequest, url, options)
}

export default class LibrariesIoBase extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context, config)
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
