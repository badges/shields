import queryString from 'querystring'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'SonarRedirect',
  title: 'SonarRedirect',
  pathPrefix: '/sonar',
})

t.create('sonar version')
  .get(
    '/4.2/http/sonar.petalslink.com/org.ow2.petals:petals-se-ase/alert_status.svg'
  )
  .expectRedirect(
    `/sonar/alert_status/org.ow2.petals:petals-se-ase.svg?${queryString.stringify(
      {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      }
    )}`
  )

t.create('sonar host parameter')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals:petals-se-ase/alert_status.svg'
  )
  .expectRedirect(
    `/sonar/alert_status/org.ow2.petals:petals-se-ase.svg?${queryString.stringify(
      {
        server: 'http://sonar.petalslink.com',
      }
    )}`
  )

t.create('sonar host parameter with version')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals:petals-se-ase/alert_status.svg?sonarVersion=4.2'
  )
  .expectRedirect(
    `/sonar/alert_status/org.ow2.petals:petals-se-ase.svg?${queryString.stringify(
      {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      }
    )}`
  )
