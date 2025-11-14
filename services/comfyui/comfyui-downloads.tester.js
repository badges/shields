import { readFileSync } from 'fs'
import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isMetric = Joi.string().regex(/^\d+(\.\d+)?[kmb]?$/)

const fixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/comfyui_node.json', import.meta.url),
    'utf8',
  ),
)

t.create('Downloads (valid)')
  .get('/comfyui-image-captioner/downloads.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, fixture),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Downloads (node not found)')
  .get('/nonexistent-node/downloads.json')
  .expectBadge({ label: 'downloads', message: 'node not found' })
