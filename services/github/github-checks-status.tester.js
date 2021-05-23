const t = (function() {
  export default __a;
}())
import {isBuildStatus} from '../build-status.js';

t.create('branch checks (branch)')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'checks',
    message: isBuildStatus,
  })

t.create('checks - nonexistent ref')
  .get('/badges/shields/this-ref-does-not-exist.json')
  .expectBadge({
    label: 'checks',
    message: 'ref or repo not found',
    color: 'red',
  })
