import { redirector } from '../index.js'
import { documentation } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'maven-central/v',
    pattern: ':groupId/:artifactId/:versionPrefix?',
  },
  examples: [
    {
      title: 'Maven Central',
      pattern: ':groupId/:artifactId',
      queryParams: {
        versionSuffix: '-android',
        versionPrefix: '29',
      },
      namedParams: {
        groupId: 'com.google.guava',
        artifactId: 'guava',
      },
      staticPreview: {
        label: 'maven-central',
        message: 'v29.0-android',
        color: 'blue',
      },
      documentation,
    },
  ],
  transformPath: () => `/maven-metadata/v`,
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
