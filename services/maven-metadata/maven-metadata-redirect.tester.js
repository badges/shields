import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('maven metadata (badge extension)')
  .get(
    '/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml.json'
  )
  .expectRedirect(
    `/maven-metadata/v.json?metadataUrl=${encodeURIComponent(
      'http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
    )}`
  )

t.create('maven metadata (no badge extension)')
  .get(
    '/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
  )
  .expectRedirect(
    `/maven-metadata/v.svg?metadataUrl=${encodeURIComponent(
      'http://central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml'
    )}`
  )
