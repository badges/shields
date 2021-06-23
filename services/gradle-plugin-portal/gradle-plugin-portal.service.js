'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
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
    {
      title: 'Gradle Plugin Portal with version prefix filter',
      queryParams: {
        versionPrefix: '0.13',
      },
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.13.0',
        color: 'blue',
      },
    },
    {
      title: 'Gradle Plugin Portal with version suffix filter',
      queryParams: {
        versionSuffix: '.1',
      },
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'maven-central',
        message: 'v30.1.1-android',
        color: 'blue',
      },
    },
    {
      title: 'Gradle Plugin Portal with version prefix and suffix filter',
      queryParams: {
        versionSuffix: '.1',
        versionPrefix: '0.10',
      },
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'maven-central',
        message: 'v29.0-android',
        color: 'blue',
      },
    },
  ],
  transformPath: () => `/maven-metadata/v`,
  transformQueryParams: ({ pluginId }) => {
    const groupPath = pluginId.replace(/\./g, '/')
    const artifactId = `${pluginId}.gradle.plugin`
    const metadataUrl = `https://plugins.gradle.org/m2/${groupPath}/${artifactId}/maven-metadata.xml`
    return {
      metadataUrl,
      label: 'plugin portal',
    }
  },
  overrideTransformedQueryParams: true,
  dateAdded: new Date('2021-05-30'),
})
