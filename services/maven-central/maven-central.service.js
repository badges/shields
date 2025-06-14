import { redirector, pathParam } from '../index.js'
import { commonParams } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'maven-central/v',
    pattern: ':groupId/:artifactId/:versionPrefix?',
  },
  openApi: {
    '/maven-central/v/{groupId}/{artifactId}': {
      get: {
        summary: 'Maven Central Version',
        parameters: [
          pathParam({ name: 'groupId', example: 'com.google.guava' }),
          pathParam({ name: 'artifactId', example: 'guava' }),
          ...commonParams,
        ],
      },
    },
  },
  transformPath: () => '/maven-metadata/v',
  transformQueryParams: ({ groupId, artifactId, versionPrefix }) => {
    const group = encodeURIComponent(groupId).replace(/\./g, '/')
    const artifact = encodeURIComponent(artifactId)
    const metadataUrl = `https://repo1.maven.org/maven2/${group}/${artifact}/maven-metadata.xml`
    return {
      metadataUrl,
      label: 'maven-central',
      versionPrefix,
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-06-12'),
})
