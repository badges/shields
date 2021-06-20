import { createServiceTester } from '../tester.js'
import { isReuseCompliance, COLOR_MAP } from './reuse-compliance-helper.js'
export const t = await createServiceTester()

t.create('valid repo -- live')
  .get('/github.com/fsfe/reuse-tool.json')
  .expectBadge({
    label: 'reuse',
    message: isReuseCompliance,
    color: COLOR_MAP[isReuseCompliance],
  })

t.create('valid repo -- compliant')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'compliant' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'compliant',
    color: COLOR_MAP.compliant,
  })

t.create('valid repo -- non-compliant')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'non-compliant' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'non-compliant',
    color: COLOR_MAP['non-compliant'],
  })

t.create('valid repo -- checking')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'checking' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'checking',
    color: COLOR_MAP.checking,
  })

t.create('valid repo -- unregistered')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'unregistered' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'unregistered',
    color: COLOR_MAP.unregistered,
  })

t.create('invalid repo').get('/github.com/repo/invalid-repo.json').expectBadge({
  label: 'reuse',
  message: 'Not a Git repository',
})
