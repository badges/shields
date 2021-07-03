import { redirector } from '../index.js'
import { documentation } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
    pattern: ':pluginId',
  },
  examples: [
    {
      title: 'Gradle Plugin Portal',
      queryParams: {
        versionSuffix: '.1',
        versionPrefix: '0.10',
      },
      namedParams: {
        pluginId: 'com.gradle.plugin-publish',
      },
      staticPreview: {
        label: 'plugin portal',
        message: 'v0.10.1',
        color: 'blue',
      },
      documentation,
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
