import { BaseXmlService } from '../index.js'

export default class EclipseMarketplaceBase extends BaseXmlService {
  static buildRoute(base) {
    return {
      base,
      pattern: ':name',
    }
  }

  async fetch({ name, schema }) {
    return this._requestXml({
      schema,
      url: `https://marketplace.eclipse.org/content/${name}/api/p`,
      errorMessages: { 404: 'solution not found' },
    })
  }
}
