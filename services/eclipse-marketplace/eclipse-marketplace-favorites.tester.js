import Joi from 'joi';
const t = (function() {
  export default __a;
}())

t.create('favorites count').get('/notepad4e.json').expectBadge({
  label: 'favorites',
  message: Joi.number().integer().positive(),
})

t.create('favorites for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'favorites',
    message: 'solution not found',
  })
