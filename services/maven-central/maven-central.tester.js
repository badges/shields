import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('latest version redirection')
  .get('/com.github.fabriziocucci/yacl4j.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectRedirect(
    `/maven-metadata/v.json?label=maven-central&metadataUrl=${encodeURIComponent(
      'https://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/maven-metadata.xml'
    )}`
  )

t.create('latest 0.8 version redirection')
  .get('/com.github.fabriziocucci/yacl4j/0.8.json') // http://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/
  .expectRedirect(
    `/maven-metadata/v.json?label=maven-central&metadataUrl=${encodeURIComponent(
      'https://repo1.maven.org/maven2/com/github/fabriziocucci/yacl4j/maven-metadata.xml'
    )}&versionPrefix=0.8`
  )
