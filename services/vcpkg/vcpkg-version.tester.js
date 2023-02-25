import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the port version of entt using `version` field')
  .get('/entt.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: Joi.string() })

t.create('gets the port version of opengl using `version-date` field')
  .get('/opengl.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: Joi.string() })

t.create('gets the port version of nlohmann-json using `version-semver` field')
  .get('/nlohmann-json.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: Joi.string() })

t.create('gets the port version of 7zip using `version-string` field')
  .get('/7zip.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: Joi.string() })

t.create('returns not found for invalid port')
  .get('/this-port-does-not-exist.json')
  .expectBadge({
    label: 'vcpkg',
    color: 'red',
    message: 'port not found',
  })
