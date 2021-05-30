'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
    // TODO: add /:versionPrefix? when maven-metadata have versionPrefix attribute.
    pattern: ':pluginId',
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
    /*
    {
      title: 'Gradle Plugin Portal with version prefix filter',
      pattern: ':pluginId/:versionPrefix',
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
        versionPrefix: '0.10',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.10.1',
        color: 'blue',
      },
    },
     */
  ],
  transformPath: () => `/maven-metadata/v`,
  transformQueryParams: ({ pluginId }) => {
    const groupPath = pluginId.replaceAll('.', '/')
    const artifactId = `${pluginId}.gradle.plugin`
    const metadataUrl = `https://plugins.gradle.org/m2/${groupPath}/${artifactId}/maven-metadata.xml`
    return {
      metadataUrl,
      label: 'plugin portal',
      color: 'blue',
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-05-30'),
})
