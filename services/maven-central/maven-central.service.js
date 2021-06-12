'use strict'

const { redirector } = require('..')

module.exports = redirector({
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
      namedParams: {
        groupId: 'org.apache.maven',
        artifactId: 'apache-maven',
      },
      staticPreview: {
        label: 'maven-central',
        message: 'v3.6.0',
        color: 'blue',
      },
    },
    {
      title: 'Maven Central with version prefix filter',
      pattern: ':groupId/:artifactId/:versionPrefix',
      namedParams: {
        groupId: 'org.apache.maven',
        artifactId: 'apache-maven',
        versionPrefix: '2',
      },
      staticPreview: {
        label: 'maven-central',
        message: 'v2.2.1',
        color: 'blue',
      },
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
      color: 'blue',
      versionPrefix,
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-06-12'),
})
