import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('reproducible gav')
  .get('/org.apache.maven/maven-core/3.9.9.json')
  .expectBadge({
    label: 'reproducible builds',
    message: '75/75',
    color: 'brightgreen',
  })

t.create('mostly reproducible gav')
  .get('/org.apache.maven/maven-core/3.8.5.json')
  .expectBadge({
    label: 'reproducible builds',
    message: '43/47',
    color: 'yellow',
  })

t.create('mostly non-reproducible gav')
  .get('/org.apache.maven/maven-core/3.6.3.json')
  .expectBadge({
    label: 'reproducible builds',
    message: '2/32',
    color: 'red',
  })

t.create('non-rebuildable gav')
  .get('/org.apache.maven/maven-core/4.0.0-alpha-2.json')
  .expectBadge({
    label: 'reproducible builds',
    message: 'unable to rebuild',
    color: 'red',
  })

t.create('unknown v for known ga')
  .get('/org.apache.maven/maven-core/3.9.9.1.json')
  .expectBadge({
    label: 'reproducible builds',
    message: 'version not available in Maven Central',
    color: 'red',
  })

t.create('untested v for known ga')
  .get('/org.apache.maven/maven-core/2.2.1.json')
  .expectBadge({
    label: 'reproducible builds',
    message: 'version not evaluated',
    color: 'grey',
  })

t.create('unknown ga').get('/org.apache.maven/any/3.9.9.json').expectBadge({
  label: 'reproducible builds',
  message: 'groupId:artifactId unknown',
  color: 'red',
})

t.create('SNAPSHOT').get('/any/any/anything-SNAPSHOT.json').expectBadge({
  label: 'reproducible builds',
  message: 'SNAPSHOT, not evaluated',
  color: 'grey',
})
