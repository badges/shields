import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isValidVersion = Joi.string()
  .regex(/^v[\d+.]+$/)
  .required()

t.create('version').get('/openresty/lua-resty-lrucache.json').expectBadge({
  label: 'opm',
  message: isValidVersion,
})

t.create('unknown module')
  .get('/openresty/does-not-exist.json')
  .expectBadge({ label: 'opm', message: 'module not found' })

t.create('unknown user')
  .get('/nil/does-not-exist.json')
  .expectBadge({ label: 'opm', message: 'module not found' })
