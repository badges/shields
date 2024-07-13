import { BaseXmlService } from '../index.js'

export default class EclipseMarketplaceBase extends BaseXmlService {
  async fetch({ name, schema }) {
    return this._requestXml({
      schema,
      url: `https://marketplace.eclipse.org/content/${name}/api/p`,
      httpErrors: { 404: 'solution not found' },
    })
  }
}
