import {withRegex} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('GitHub Total Discussions (repo not found)')
  .get('/not-a-user/not-a-repo.json')
  .expectBadge({ label: 'discussions', message: 'repo not found' })

// example: 6000 total
const numberSpaceTotal = withRegex(/^\d+ total$/)

t.create('GitHub Total Discussions (repo having discussions)')
  .get('/vercel/next.js.json')
  .expectBadge({ label: 'discussions', message: numberSpaceTotal })
