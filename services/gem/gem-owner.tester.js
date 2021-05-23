import Joi from 'joi';
const t = (function() {
  export default __a;
}())

t.create('users (valid)')
  .get('/raphink.json')
  .expectBadge({
    label: 'gems',
    message: Joi.string().regex(/^[0-9]+$/),
  })

t.create('users (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'gems', message: 'not found' })
