import { redirector, pathParam, queryParam } from '../index.js'
import { description } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'maven-central-snapshots/v',
    pattern: ':groupId/:artifactId/:versionPrefix?',
  },
  openApi: {
    '/maven-central-snapshots/v/{groupId}/{artifactId}': {
      get: {
        summary: 'Maven Central Snapshots Version',
        description,
        parameters: [
          pathParam({ name: 'groupId', example: 'com.google.guava' }),
          pathParam({ name: 'artifactId', example: 'guava' }),
          queryParam({
            name: 'versionPrefix',
            example: '29',
            description: 'Filter only versions with this prefix.',
          }),
          queryParam({
            name: 'versionSuffix',
            example: '-android',
            description: 'Filter only versions with this suffix.',
          }),
        ],
      },
    },
  },
  transformPath: () => '/maven-metadata/v',
  transformQueryParams: ({ groupId, artifactId, versionPrefix }) => {
    const group = encodeURIComponent(groupId).replace(/\./g, '/')
    const artifact = encodeURIComponent(artifactId)
    const metadataUrl = `https://central.sonatype.com/repository/maven-snapshots/${group}/${artifact}/maven-metadata.xml`
    return {
      metadataUrl,
      label: 'maven-central-snapshots',
      versionPrefix,
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-06-12'),
})
