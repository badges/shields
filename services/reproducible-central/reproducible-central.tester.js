import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('reproducible gav')
  .get('/org.apache.maven/maven-core/3.9.9')
  .expectBadge({
    label: 'Reproducible Builds',
    message: '47/47',
    color: 'green',
  })

t.create('mostly reproducible gav')
  .get('/org.apache.maven/maven-core/3.8.5')
  .expectBadge({
    label: 'Reproducible Builds',
    message: '43/47',
    color: 'yellow',
  })

t.create('mostly non-reproducible gav')
  .get('/org.apache.maven/maven-core/3.6.3')
  .expectBadge({
    label: 'Reproducible Builds',
    message: '2/32',
    color: 'red',
  })

t.create('non-rebuildable gav')
  .get('/org.apache.maven/maven-core/4.0.0-alpha-2')
  .expectBadge({
    label: 'Reproducible Builds',
    message: 'X',
    color: 'red',
  })

t.create('unknown v for known ga')
  .get('/org.apache.maven/maven-core/3.9.9.1')
  .expectBadge({
    label: 'Reproducible Builds',
    message: '3.9.9.1',
    color: 'grey',
  })

t.create('unknown ga').get('/org.apache.maven/any/3.9.9').expectBadge({
  label: 'Reproducible Builds',
  message: 'unknown ga',
  color: 'orange',
})

t.create('SNAPSHOT').get('/any/any/anything-SNAPSHOT').expectBadge({
  label: 'Reproducible Builds',
  message: 'SNAPSHOT',
  color: 'grey',
})
