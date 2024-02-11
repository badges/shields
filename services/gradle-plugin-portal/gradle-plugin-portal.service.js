import { redirector, pathParam, queryParam } from '../index.js'
import { description } from '../maven-metadata/maven-metadata.js'

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
        description,
        parameters: [
          pathParam({ name: 'pluginId', example: 'com.gradle.plugin-publish' }),
          queryParam({
            name: 'versionPrefix',
            example: '0.10',
            description: 'Filter only versions with this prefix.',
          }),
          queryParam({
            name: 'versionSuffix',
            example: '.1',
            description: 'Filter only versions with this suffix.',
          }),
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
