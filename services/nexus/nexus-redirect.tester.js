'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'NexusRedirect',
  title: 'NexusRedirect',
  pathPrefix: '/nexus',
}))

t.create('Nexus release')
  .get('/r/https/oss.sonatype.org/com.google.guava/guava.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/nexus/r/com.google.guava/guava.json?server=${encodeURIComponent(
      'https://oss.sonatype.org'
    )}`
  )

t.create('Nexus snapshot')
  .get('/s/https/oss.sonatype.org/com.google.guava/guava.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/nexus/s/com.google.guava/guava.json?server=${encodeURIComponent(
      'https://oss.sonatype.org'
    )}`
  )

t.create('Nexus repository with query opts')
  .get(
    '/fs-public-snapshots/https/repository.jboss.org/nexus/com.progress.fuse/fusehq:p=tar.gz:c=agent-apple-osx.json',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/nexus/fs-public-snapshots/com.progress.fuse/fusehq.json?queryOpt=${encodeURIComponent(
      ':p=tar.gz:c=agent-apple-osx'
    )}&server=${encodeURIComponent('https://repository.jboss.org/nexus')}`
  )
