import { BaseJsonService } from '../index.js'

export default class BaseSourceForgeService extends BaseJsonService {
  async fetch({ project, schema }) {
    return this._requestJson({
      url: `https://sourceforge.net/rest/p/${project}/`,
      schema,
      httpErrors: {
        404: 'project not found',
      },
    })
  }
}
