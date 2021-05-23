import Joi from 'joi';
import {isVPlusDottedVersionNClausesWithOptionalSuffix} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('version (valid)')
  .get('/vibe-d.json')
  .expectBadge({
    label: 'dub',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: Joi.equal('blue', 'orange'),
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dub', message: 'not found' })
