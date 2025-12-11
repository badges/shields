import { readFileSync } from 'fs'
import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isNumber = Joi.string().regex(/^\d+$/)

const fixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/comfyui_node.json', import.meta.url),
    'utf8',
  ),
)

t.create('Stars (valid)')
  .get('/comfyui-image-captioner/stars.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, fixture),
  )
  .expectBadge({
    label: 'stars',
    message: isNumber,
  })

t.create('Stars (no github stars)')
  .get('/comfyui-image-captioner/stars.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, {
        id: 'comfyui-image-captioner',
        name: 'ComfyUI-Image-Captioner',
        downloads: 4894,
        github_stars: null,
      }),
  )
  .expectBadge({ label: 'stars', message: 'unknown' })

t.create('Stars (node not found)')
  .get('/nonexistent-node/stars.json')
  .expectBadge({ label: 'stars', message: 'node not found' })
