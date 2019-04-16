'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'SonarRedirect',
  title: 'SonarRedirect',
  pathPrefix: '/sonar',
}))

t.create('sonar version')
  .get(
    '/4.2/http/sonar.petalslink.com/org.ow2.petals:petals-se-ase/alert_status.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/sonar/http/sonar.petalslink.com/org.ow2.petals:petals-se-ase/alert_status.svg?sonarVersion=4.2'
  )
