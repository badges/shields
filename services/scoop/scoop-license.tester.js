import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('License (valid) - with nested response')
  .get('/ngrok.json')
  .expectBadge({
    label: 'license',
    message: 'Shareware',
  })

t.create('License (valid) - with string response')
  .get('/nvs.json')
  .expectBadge({
    label: 'license',
    message: 'MIT',
  })

t.create('License (invalid)').get('/not-a-real-app.json').expectBadge({
  label: 'license',
  message: 'not-a-real-app not found in bucket "main"',
})

t.create('License (valid custom bucket)')
  .get('/atom.json?bucket=extras')
  .expectBadge({
    label: 'license',
    message: 'MIT',
  })

t.create('license (not found in custom bucket)')
  .get('/not-a-real-app.json?bucket=extras')
  .expectBadge({
    label: 'license',
    message: 'not-a-real-app not found in bucket "extras"',
  })

t.create('license (wrong bucket)')
  .get('/not-a-real-app.json?bucket=not-a-real-bucket')
  .expectBadge({
    label: 'license',
    message: 'bucket "not-a-real-bucket" not found',
  })

// version (bucket url)
const validBucketUrl = encodeURIComponent(
  'https://github.com/jewlexx/personal-scoop',
)

t.create('license (valid bucket url)')
  .get(`/sfsu.json?bucket=${validBucketUrl}`)
  .expectBadge({
    label: 'license',
    message: 'Apache-2.0',
  })

const validBucketUrlTrailingSlash = encodeURIComponent(
  'https://github.com/jewlexx/personal-scoop/',
)

t.create('license (valid bucket url)')
  .get(`/sfsu.json?bucket=${validBucketUrlTrailingSlash}`)
  .expectBadge({
    label: 'license',
    message: 'Apache-2.0',
  })

t.create('license (not found in custom bucket)')
  .get(`/not-a-real-app.json?bucket=${validBucketUrl}`)
  .expectBadge({
    label: 'license',
    message: `not-a-real-app not found in bucket "${decodeURIComponent(validBucketUrl)}"`,
  })

const nonGithubUrl = encodeURIComponent('https://example.com/')

t.create('license (non-github url)')
  .get(`/not-a-real-app.json?bucket=${nonGithubUrl}`)
  .expectBadge({
    label: 'license',
    message: `bucket "${decodeURIComponent(nonGithubUrl)}" not found`,
  })

const nonBucketRepo = encodeURIComponent('https://github.com/jewlexx/sfsu')

t.create('version (non-bucket repo)')
  .get(`/sfsu.json?bucket=${nonBucketRepo}`)
  .expectBadge({
    label: 'license',
    // !!! Important note here
    // It is hard to tell if a repo is actually a scoop bucket, without getting the contents
    // As such, a helpful error message here, which would require testing if the url is a valid scoop bucket, is difficult.
    message: `sfsu not found in bucket "${decodeURIComponent(nonBucketRepo)}"`,
  })
