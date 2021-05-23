import Joi from 'joi';
const t = (function() {
  export default __a;
}())

// Github allows versions with chars, etc.
const isAnyV = Joi.string().regex(/^v.+$/)

t.create('version (groupId)')
  .get('/github/erayerdin/kappdirs.json')
  .expectBadge({ label: 'jitpack', message: isAnyV })

t.create('unknown package')
  .get('/github/some-bogus-user/project.json')
  .expectBadge({ label: 'jitpack', message: 'project not found or private' })
