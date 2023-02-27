import Joi from 'joi'
import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isDateWithOptionalNumericSequenceVersion = Joi.string().regex(
  /^\d{4}-\d{2}-\d{2}(\.(0|[1-9]\d*))?$/
)

const isArbitraryStringVersion = Joi.string()

t.create('gets entt port version')
  .get('/entt.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: isSemver })

t.create('gets not found error for invalid port')
  .get('/this-port-does-not-exist.json')
  .expectBadge({
    label: 'vcpkg',
    color: 'red',
    message: 'port not found',
  })

t.create('gets uvw port version using `version` field')
  .get('/uvw.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/microsoft/vcpkg/master/ports/uvw/vcpkg.json')
        .reply(200, {
          name: 'uvw',
          version: '2.12.1',
          'port-version': 2,
          description:
            'Header-only, event based, tiny and easy to use libuv wrapper in modern C++.',
          homepage: 'https://github.com/skypjack/uvw',
          license: 'MIT',
          dependencies: [
            'libuv',
            {
              name: 'vcpkg-cmake',
              host: true,
            },
            {
              name: 'vcpkg-cmake-config',
              host: true,
            },
          ],
        }),
    {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'vcpkg',
    color: 'blue',
    message: isSemver,
  })

t.create('gets opengl port version using `version-date` field')
  .get('/opengl.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/microsoft/vcpkg/master/ports/opengl/vcpkg.json')
        .reply(200, {
          name: 'opengl',
          'version-date': '2022-12-04',
          'port-version': 1,
          description:
            'Open Graphics Library (OpenGL)[3][4][5] is a cross-language, cross-platform application programming interface (API) for rendering 2D and 3D vector graphics.',
          license: null,
          dependencies: ['opengl-registry'],
        }),
    {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'vcpkg',
    color: 'blue',
    message: isDateWithOptionalNumericSequenceVersion,
  })

t.create('gets nlohmann-json port version using `version-semver` field')
  .get('/nlohmann-json.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/microsoft/vcpkg/master/ports/nlohmann-json/vcpkg.json')
        .reply(200, {
          name: 'nlohmann-json',
          'version-semver': '3.11.2',
          description: 'JSON for Modern C++',
          homepage: 'https://github.com/nlohmann/json',
          license: 'MIT',
          dependencies: [
            {
              name: 'vcpkg-cmake',
              host: true,
            },
            {
              name: 'vcpkg-cmake-config',
              host: true,
            },
          ],
          features: {
            diagnostics: {
              description: 'Build json_diagnostics',
            },
          },
        }),
    {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  )
  .expectBadge({ label: 'vcpkg', color: 'blue', message: isSemver })

t.create('gets 7zip port version using `version-string` field')
  .get('/7zip.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get('/microsoft/vcpkg/master/ports/7zip/vcpkg.json')
        .reply(200, {
          name: '7zip',
          'version-string': '22.01',
          description:
            'Library for archiving file with a high compression ratio.',
          homepage: 'https://www.7-zip.org',
          license: 'LGPL-2.1-or-later',
          supports: '!uwp',
          dependencies: [
            {
              name: 'vcpkg-cmake',
              host: true,
            },
            {
              name: 'vcpkg-cmake-config',
              host: true,
            },
          ],
        }),
    {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'vcpkg',
    color: 'blue',
    message: isArbitraryStringVersion,
  })

t.create('gets invalid response for missing version field')
  .get('/this-port-does-not-exist.json')
  .intercept(
    nock =>
      nock('https://raw.githubusercontent.com')
        .get(
          '/microsoft/vcpkg/master/ports/this-port-does-not-exist/vcpkg.json'
        )
        .reply(200, {
          name: 'this-port-does-not-exist',
        }),
    {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  )
  .expectBadge({
    label: 'vcpkg',
    color: 'lightgrey',
    message: 'invalid response data',
  })
