import Joi from 'joi';
import {isStarRating} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('stars of component displayed in star icons')
  .get('/star/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'stars',
    message: isStarRating,
  })

t.create('stars of component displayed in star icons')
  .get('/stars/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'stars',
    message: isStarRating,
  })

t.create('rating of the component (eg: 4.2/5)')
  .get('/rating/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\.\d\/5$/),
  })

t.create('not found').get('/rating/does-not-exist.json').expectBadge({
  label: 'rating',
  message: 'not found',
})
