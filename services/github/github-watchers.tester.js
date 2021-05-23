import Joi from 'joi';
const t = (function() {
  export default __a;
}())

t.create('Watchers')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'watchers',
    message: Joi.number().integer().positive(),
    color: 'blue',
    link: [
      'https://github.com/badges/shields',
      'https://github.com/badges/shields/watchers',
    ],
  })

t.create('Watchers (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'watchers',
  message: 'repo not found',
})
