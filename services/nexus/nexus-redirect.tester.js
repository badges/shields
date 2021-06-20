import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'NexusRedirect',
  title: 'NexusRedirect',
  pathPrefix: '/nexus',
})

t.create('Nexus release')
  .get('/r/https/oss.sonatype.org/com.google.guava/guava.svg')
  .expectRedirect(
    `/nexus/r/com.google.guava/guava.svg?server=${encodeURIComponent(
      'https://oss.sonatype.org'
    )}`
  )

t.create('Nexus snapshot')
  .get('/s/https/oss.sonatype.org/com.google.guava/guava.svg')
  .expectRedirect(
    `/nexus/s/com.google.guava/guava.svg?server=${encodeURIComponent(
      'https://oss.sonatype.org'
    )}`
  )

t.create('Nexus repository with query opts')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:p=tar.gz:c=agent-apple-osx.svg'
  )
  .expectRedirect(
    `/nexus/fs-public-snapshots/com.progress.fuse/fusehq.svg?queryOpt=${encodeURIComponent(
      ':p=tar.gz:c=agent-apple-osx'
    )}&server=${encodeURIComponent('https://repository.jboss.org/nexus')}`
  )
