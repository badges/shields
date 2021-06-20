import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'ScrutinizerBuild',
  title: 'ScrutinizerBuild',
  pathPrefix: '/scrutinizer/build',
})

t.create('build (GitHub)')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build (Bitbucket)')
  .get('/b/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build - unknown status')
  .get('/g/filp/whoops.json')
  .intercept(nock =>
    nock('https://scrutinizer-ci.com')
      .get('/api/repositories/g/filp/whoops')
      .reply(200, {
        default_branch: 'master',
        applications: {
          master: {
            build_status: {
              status: 'unknown',
            },
          },
        },
      })
  )
  .expectBadge({
    label: 'build',
    message: 'unknown',
    color: 'lightgrey',
  })

t.create('build private project')
  .get('/gl/propertywindow/propertywindow/client.json')
  .expectBadge({
    label: 'build',
    message: 'not authorized to access project',
  })

t.create('build nonexistent project').get('/gp/foo.json').expectBadge({
  label: 'build',
  message: 'project not found',
})

t.create('build nonexistent branch')
  .get('/g/phpmyadmin/phpmyadmin/super-fake/not-real-branch.json')
  .expectBadge({
    label: 'build',
    message: 'branch not found',
  })
