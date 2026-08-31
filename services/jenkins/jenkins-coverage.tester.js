import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('code coverage API: job found')
  .get('.json?jobUrl=https://jenkins.mm12.xyz/jenkins/job/nmfu/job/master')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('code coverage API: job not found')
  .get('.json?jobUrl=https://jenkins.mm12.xyz/jenkins/job/does-not-exist')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })
