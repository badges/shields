import { redirector, pathParam } from '../index.js'
import { commonParams } from '../maven-metadata/maven-metadata.js'

export default redirector({
  category: 'version',
  isDeprecated: false,
  route: {
    base: 'gradle-plugin-portal/v',
    pattern: ':pluginId',
  },
  openApi: {
    '/gradle-plugin-portal/v/{pluginId}': {
      get: {
        summary: 'Gradle Plugin Portal Version',
        parameters: [
          pathParam({ name: 'pluginId', example: 'com.gradle.plugin-publish' }),
          ...commonParams,
        ],
      },
    },
  },
  transformPath: () => '/maven-metadata/v',
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
