import { isIntegerPercentage } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'ScrutinizerCoverage',
  title: 'ScrutinizerCoverage',
  pathPrefix: '/scrutinizer/coverage',
})

t.create('code coverage (GitHub)').get('/g/filp/whoops.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('code coverage branch (GitHub)')
  .get('/g/PHPMailer/PHPMailer/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('code coverage (Bitbucket)')
  .get('/b/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('code coverage private project')
  .get('/gl/propertywindow/propertywindow/client.json')
  .expectBadge({
    label: 'coverage',
    message: 'not authorized to access project',
  })

t.create('code coverage nonexistent project').get('/gp/foo.json').expectBadge({
  label: 'coverage',
  message: 'project not found',
})
