import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isLuaVersion = Joi.string()
  .regex(/^v\d+\.\d+\.\d+-\d+$/)
  .required()

t.create('version').get('/mpeterv/luacheck.json').expectBadge({
  label: 'luarocks',
  message: isLuaVersion,
})

t.create('specified version')
  .get('/mpeterv/luacheck/0.9.0-1.json')
  .expectBadge({ label: 'luarocks', message: 'v0.9.0-1' })

t.create('unknown version')
  .get('/mpeterv/luacheck/0.0.0.json')
  .expectBadge({ label: 'luarocks', message: 'version not found' })

t.create('unknown module')
  .get('/mpeterv/does-not-exist.json')
  .expectBadge({ label: 'luarocks', message: 'module not found' })

t.create('unknown user')
  .get('/nil/does-not-exist.json')
  .expectBadge({ label: 'luarocks', message: 'user not found' })
