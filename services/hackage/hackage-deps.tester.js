import Joi from 'joi';
const t = (function() {
  export default __a;
}())

t.create('hackage deps (valid)')
  .get('/lens.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string().regex(/^(up to date|outdated)$/),
  })

t.create('hackage deps (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
