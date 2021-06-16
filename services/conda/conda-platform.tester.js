import Joi from 'joi';
const isCondaPlatform = Joi.string().regex(/^\w+-[\w\d]+( \| \w+-[\w\d]+)*$/)
import {createServiceTester} from '../tester.js'
export const t = await createServiceTester()

t.create('platform').get('/p/conda-forge/zlib.json').expectBadge({
  label: 'conda|platform',
  message: isCondaPlatform,
})

t.create('platform (skip prefix)')
  .get('/pn/conda-forge/zlib.json')
  .expectBadge({
    label: 'platform',
    message: isCondaPlatform,
  })
