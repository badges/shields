import {isVPlusTripleDottedVersion} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('homebrew (valid)').get('/cake.json').expectBadge({
  label: 'homebrew',
  message: isVPlusTripleDottedVersion,
})

t.create('homebrew (valid)')
  .get('/cake.json')
  .intercept(nock =>
    nock('https://formulae.brew.sh')
      .get('/api/formula/cake.json')
      .reply(200, { versions: { stable: '0.23.0', devel: null, head: null } })
  )
  .expectBadge({ label: 'homebrew', message: 'v0.23.0' })

t.create('homebrew (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'homebrew', message: 'not found' })
