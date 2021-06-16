import joiModule from 'joi';
const Joi = joiModule.extend(joi => ({
  base: joi.array(),
  coerce: (value, helpers) => ({
    value: value.split ? value.split(' | ') : value,
  }),
  type: 'versionArray',
}))
const isDottedVersionAtLeastOne = Joi.string().regex(/\d+(\.\d+)?(\.\d+)?$/)
import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()

t.create('Nucleus (pluginId nucleus)')
  .get('/nucleus.json')
  .expectBadge({
    label: 'sponge',
    message: Joi.versionArray().items(isDottedVersionAtLeastOne),
  })

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'sponge',
  message: 'not found',
})
