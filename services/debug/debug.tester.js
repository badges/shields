import Joi from 'joi';
const t = (function() {
  export default __a;
}())

t.create('start time')
  .get('/starttime.json')
  .expectBadge({ label: 'start time', message: Joi.date().required() })

t.create('Flip: first request')
  .get('/flip.json')
  .expectBadge({ label: 'flip', message: 'on' })

t.create('Flip: second request')
  .get('/flip.json')
  .expectBadge({ label: 'flip', message: 'off' })
