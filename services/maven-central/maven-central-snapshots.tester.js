import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('latest version redirection')
  .get('/me.mrdoc.minecraft/dlibcustomextensions.json') // https://central.sonatype.com/repository/maven-snapshots/me/mrdoc/minecraft/dlibcustomextensions/
  .expectRedirect(
    `/maven-metadata/v.json?label=maven-central-snapshots&metadataUrl=${encodeURIComponent(
      'https://central.sonatype.com/repository/maven-snapshots/me/mrdoc/minecraft/dlibcustomextensions/maven-metadata.xml',
    )}`,
  )

t.create('latest 1.0 version redirection')
  .get('/me.mrdoc.minecraft/dlibcustomextensions/1.0.json') // https://central.sonatype.com/repository/maven-snapshots/me/mrdoc/minecraft/dlibcustomextensions/
  .expectRedirect(
    `/maven-metadata/v.json?label=maven-central-snapshot&metadataUrl=${encodeURIComponent(
      'https://central.sonatype.com/repository/maven-snapshots/me/mrdoc/minecraft/dlibcustomextensions/maven-metadata.xml',
    )}&versionPrefix=1.0`,
  )
