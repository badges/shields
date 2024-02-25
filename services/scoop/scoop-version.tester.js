import { ServiceTester } from '../tester.js'
import { isVPlusDottedVersionNClauses } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'scoop',
  title: 'Scoop',
})

// version

t.create('version (valid)').get('/v/apache.json').expectBadge({
  label: 'scoop',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (not found)').get('/v/not-a-real-app.json').expectBadge({
  label: 'scoop',
  message: 'not-a-real-app not found in bucket "main"',
})

// version (custom bucket)

t.create('version (valid custom bucket)')
  .get('/v/dnspy.json?bucket=extras')
  .expectBadge({
    label: 'scoop',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (not found in custom bucket)')
  .get('/v/not-a-real-app.json?bucket=extras')
  .expectBadge({
    label: 'scoop',
    message: 'not-a-real-app not found in bucket "extras"',
  })

t.create('version (wrong bucket)')
  .get('/v/not-a-real-app.json?bucket=not-a-real-bucket')
  .expectBadge({
    label: 'scoop',
    message: 'bucket "not-a-real-bucket" not found',
  })

// version (bucket url)
const validBucketUrl = encodeURIComponent(
  'https://github.com/jewlexx/personal-scoop',
)

t.create('version (valid bucket url)')
  .get(`/v/sfsu.json?bucket=${validBucketUrl}`)
  .expectBadge({
    label: 'scoop',
    message: isVPlusDottedVersionNClauses,
  })

const validBucketUrlTrailingSlash = encodeURIComponent(
  'https://github.com/jewlexx/personal-scoop/',
)

t.create('version (valid bucket url)')
  .get(`/v/sfsu.json?bucket=${validBucketUrlTrailingSlash}`)
  .expectBadge({
    label: 'scoop',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (not found in custom bucket)')
  .get(`/v/not-a-real-app.json?bucket=${validBucketUrl}`)
  .expectBadge({
    label: 'scoop',
    message: `not-a-real-app not found in bucket "${decodeURIComponent(validBucketUrl)}"`,
  })

const nonGithubUrl = encodeURIComponent('https://example.com/')

t.create('version (non-github url)')
  .get(`/v/not-a-real-app.json?bucket=${nonGithubUrl}`)
  .expectBadge({
    label: 'scoop',
    message: `bucket "${decodeURIComponent(nonGithubUrl)}" not found`,
  })

const nonBucketRepo = encodeURIComponent('https://github.com/jewlexx/sfsu')

t.create('version (non-bucket repo)')
  .get(`/v/sfsu.json?bucket=${nonBucketRepo}`)
  .expectBadge({
    label: 'scoop',
    // !!! Important note here
    // It is hard to tell if a repo is actually a scoop bucket, without getting the contents
    // As such, a helpful error message here, which would require testing if the url is a valid scoop bucket, is difficult.
    message: `sfsu not found in bucket "${decodeURIComponent(nonBucketRepo)}"`,
  })
