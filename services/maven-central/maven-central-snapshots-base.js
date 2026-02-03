import { BaseXmlService } from '../index.js'

export default class MavenCentralSnapshotsBase extends BaseXmlService {
  async fetch({ groupId, artifactId, schema }) {
    const group = encodeURIComponent(groupId).replace(/\./g, '/')
    const artifact = encodeURIComponent(artifactId)
    return this._requestXml({
      schema,
      url: `https://central.sonatype.com/repository/maven-snapshots/${group}/${artifact}/maven-metadata.xml`,
      httpErrors: { 404: 'artifact not found' },
    })
  }
}
