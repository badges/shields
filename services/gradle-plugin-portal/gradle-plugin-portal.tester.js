import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gradle plugin portal')
  .get('/com.gradle.plugin-publish')
  .expectRedirect(
    `/maven-metadata/v.svg?label=plugin%20portal&metadataUrl=${encodeURIComponent(
      'https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/maven-metadata.xml'
    )}`
  )

t.create('gradle plugin portal with custom labels')
  .get('/com.gradle.plugin-publish?label=custom%20label')
  .expectRedirect(
    `/maven-metadata/v.svg?label=custom%20label&metadataUrl=${encodeURIComponent(
      'https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/maven-metadata.xml'
    )}`
  )

t.create('gradle plugin portal with custom color')
  .get('/com.gradle.plugin-publish?color=gray')
  .expectRedirect(
    `/maven-metadata/v.svg?color=gray&label=plugin%20portal&metadataUrl=${encodeURIComponent(
      'https://plugins.gradle.org/m2/com/gradle/plugin-publish/com.gradle.plugin-publish.gradle.plugin/maven-metadata.xml'
    )}`
  )
