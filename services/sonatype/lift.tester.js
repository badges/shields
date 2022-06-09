import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('repository exists')
  .get('/foo/bar.json')
  .intercept(nock =>
    nock('https://lift.sonatype.com/api/badge').get('/foo/bar').reply(200, {
      label: 'Protected by',
      message: 'Sonatype Lift',
      url: 'https://lift.sonatype.com/results/github.com/foo/bar',
    })
  )
  .expectBadge({
    label: 'Protected by',
    message: 'Sonatype Lift',
    link: ['https://lift.sonatype.com/results/github.com/foo/bar'],
  })

t.create('repository does not exists')
  .get('/foo/bar.json')
  .intercept(nock =>
    nock('https://lift.sonatype.com/api/badge').get('/foo/bar').reply(200, {
      label: 'Unprotected by',
      message: 'Sonatype Lift',
      url: 'https://lift.sonatype.com',
    })
  )
  .expectBadge({
    label: 'Unprotected by',
    message: 'Sonatype Lift',
    link: ['https://lift.sonatype.com'],
  })
