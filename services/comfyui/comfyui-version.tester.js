import { readFileSync } from 'fs'
import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isVersion = Joi.string().regex(/^v\d+(\.\d+)*/)

const fixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/comfyui_node.json', import.meta.url),
    'utf8',
  ),
)

t.create('Version (latest_version.version)')
  .get('/comfyui-image-captioner/version.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, fixture),
  )
  .expectBadge({
    label: 'comfyui',
    message: isVersion,
  })

t.create('Version (top-level version field)')
  .get('/comfyui-image-captioner/version.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, {
        id: 'comfyui-image-captioner',
        name: 'ComfyUI-Image-Captioner',
        downloads: 4894,
        github_stars: 19,
        version: '2.3.4',
      }),
  )
  .expectBadge({
    label: 'comfyui',
    message: isVersion,
  })

t.create('Version (info.version)')
  .get('/comfyui-image-captioner/version.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, {
        id: 'comfyui-image-captioner',
        name: 'ComfyUI-Image-Captioner',
        downloads: 4894,
        github_stars: 19,
        info: { version: '0.9.0' },
      }),
  )
  .expectBadge({
    label: 'comfyui',
    message: isVersion,
  })

t.create('Version (latest.version)')
  .get('/comfyui-image-captioner/version.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, {
        id: 'comfyui-image-captioner',
        name: 'ComfyUI-Image-Captioner',
        downloads: 4894,
        github_stars: 19,
        latest: { version: '3.0' },
      }),
  )
  .expectBadge({
    label: 'comfyui',
    message: isVersion,
  })

t.create('Version (not found - no version fields)')
  .get('/comfyui-image-captioner/version.json')
  .intercept(nock =>
    nock('https://api.comfy.org')
      .get('/nodes/comfyui-image-captioner')
      .reply(200, {
        id: 'comfyui-image-captioner',
        name: 'ComfyUI-Image-Captioner',
        downloads: 4894,
        github_stars: 19,
      }),
  )
  .expectBadge({ label: 'comfyui', message: 'version not found' })

t.create('Version (node not found)')
  .get('/nonexistent-node/version.json')
  .expectBadge({ label: 'comfyui', message: 'node not found' })
