import { BaseXmlService } from '../index.js'

export default class MavenCentralBase extends BaseXmlService {
  async fetch({ groupId, artifactId, schema }) {
    const group = encodeURIComponent(groupId).replace(/\./g, '/')
    const artifact = encodeURIComponent(artifactId)
    return this._requestXml({
      schema,
      url: `https://repo1.maven.org/maven2/${group}/${artifact}/maven-metadata.xml`,
      httpErrors: { 404: 'artifact not found' },
    })
  }
}
