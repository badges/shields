import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isRequireStatus = Joi.string().regex(
  /^(up to date|outdated|insecure|unknown)$/
)

// Package targets can be found at https://requires.io/public
// However, there does seem to be some retention issues where
// results for projects are purged after some number of days.
// https://github.com/badges/shields/issues/7015
// https://github.com/requires/api/issues/5
t.create('requirements (valid GitHub, without branch)')
  .get('/github/Hongbo-Miao/hongbomiao.com.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (valid GitHub, with branch)')
  .get('/github/Hongbo-Miao/hongbomiao.com/main.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (valid Bitbucket, without branch)')
  .get('/bitbucket/code-orange/django-ispstack.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (valid Bitbucket, with branch)')
  .get('/bitbucket/code-orange/django-ispstack/master.json')
  .expectBadge({
    label: 'requirements',
    message: isRequireStatus,
  })

t.create('requirements (not found)')
  .get('/github/PyvesB/EmptyRepo.json')
  .expectBadge({ label: 'requirements', message: 'not found' })
