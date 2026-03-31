import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

// live test: UPX.UPX has a known ReleaseDate in its installer manifest
t.create('gets the release date of UPX')
  .get('/UPX.UPX.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

// intercept test: ReleaseDate present in installer YAML
t.create('returns formatted date when ReleaseDate is present')
  .intercept(nock =>
    nock('https://api.github.com/')
      // First GraphQL call: list version directories
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              entries: [
                {
                  type: 'tree',
                  name: '5.0.2',
                  object: {
                    entries: [
                      { type: 'blob', name: 'UPX.UPX.installer.yaml' },
                      { type: 'blob', name: 'UPX.UPX.locale.en-US.yaml' },
                      { type: 'blob', name: 'UPX.UPX.yaml' },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
      // Second GraphQL call: fetch installer YAML content
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              text: 'PackageIdentifier: UPX.UPX\nPackageVersion: 5.0.2\nReleaseDate: 2025-07-20\nManifestType: installer\nManifestVersion: 1.10.0\n',
            },
          },
        },
      }),
  )
  .get('/UPX.UPX.json')
  .expectBadge({ label: 'release date', message: isFormattedDate })

// intercept test: ReleaseDate not present in installer YAML
t.create(
  'returns "release date not available" when ReleaseDate field is missing',
)
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              entries: [
                {
                  type: 'tree',
                  name: '1.0.0',
                  object: {
                    entries: [
                      { type: 'blob', name: 'Some.Package.installer.yaml' },
                      { type: 'blob', name: 'Some.Package.yaml' },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: {
              text: 'PackageIdentifier: Some.Package\nPackageVersion: 1.0.0\nManifestType: installer\nManifestVersion: 1.10.0\n',
            },
          },
        },
      }),
  )
  .get('/Some.Package.json')
  .expectBadge({
    label: 'release date',
    message: 'release date not available',
  })

// intercept test: package not found
t.create('returns "package not found" for unknown package')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            object: null,
          },
        },
      }),
  )
  .get('/Unknown.Package.json')
  .expectBadge({ label: 'release date', message: 'package not found' })
