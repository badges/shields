import Joi from 'joi';
const t = (function() {
  export default __a;
}())

const isPlatform = Joi.string().regex(
  /^(osx|ios|tvos|watchos)( \| (osx|ios|tvos|watchos))*$/
)

t.create('platform (valid)').get('/AFNetworking.json').expectBadge({
  label: 'platform',
  message: isPlatform,
})

t.create('platform (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'platform', message: 'not found' })

t.create('platform (missing platforms key)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/AFNetworking/specs/latest')
      .reply(200, { version: 'v1.0', license: 'MIT' })
  )
  .expectBadge({ label: 'platform', message: 'ios | osx' })
