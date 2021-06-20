import Joi from 'joi'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'ScrutinizerQuality',
  title: 'ScrutinizerQuality',
  pathPrefix: '/scrutinizer/quality',
})

const isQualityNumber = Joi.number().positive()

t.create('code quality (GitHub)').get('/g/filp/whoops.json').expectBadge({
  label: 'code quality',
  message: isQualityNumber,
})

t.create('code quality branch (GitHub)')
  .get('/g/PHPMailer/PHPMailer/master.json')
  .expectBadge({
    label: 'code quality',
    message: isQualityNumber,
  })

t.create('code quality (Bitbucket)')
  .get('/b/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'code quality',
    message: isQualityNumber,
  })

t.create('code quality private project')
  .get('/gl/propertywindow/propertywindow/client.json')
  .expectBadge({
    label: 'code quality',
    message: 'not authorized to access project',
  })

t.create('code quality nonexistent project').get('/gp/foo.json').expectBadge({
  label: 'code quality',
  message: 'project not found',
})

t.create('code quality data missing for default branch')
  .get('/g/filp/whoops.json')
  .intercept(nock =>
    nock('https://scrutinizer-ci.com')
      .get('/api/repositories/g/filp/whoops')
      .reply(200, {
        default_branch: 'master',
        applications: {
          'some-other-branch': {
            index: {
              _embedded: {
                project: {
                  metric_values: {
                    'scrutinizer.quality': 3.4395604395604398,
                  },
                },
              },
            },
          },
        },
      })
  )
  .expectBadge({
    label: 'code quality',
    message: 'unavailable for default branch',
  })
