'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
    pattern: ':pluginId/:versionPrefix?',
  },
  examples: [
    {
      title: 'Gradle Plugin Portal',
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.14.0',
        color: 'blue',
      },
    },
  ],
  transformPath: () => `/maven-metadata/v`,
  transformQueryParams: ({ pluginId, versionPrefix }) => {
    const groupPath = pluginId.replace(/\./g, '/')
    const artifactId = `${pluginId}.gradle.plugin`
    const metadataUrl = `https://plugins.gradle.org/m2/${groupPath}/${artifactId}/maven-metadata.xml`
    return {
      metadataUrl,
      label: 'plugin portal',
      color: 'blue',
      versionPrefix,
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-05-30'),
})
