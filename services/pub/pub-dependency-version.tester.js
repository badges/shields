import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('live dependency constraint')
  .get('/http/http_parser.json')
  .expectBadge({
    label: 'http_parser',
    message: Joi.string().pattern(/^[\^~<>=0-9]/),
    color: 'blue',
  })

for (const [name, requirement, message] of [
  ['caret constraint', '^1.2.3', '^1.2.3'],
  ['range constraint', '>=1.0.0 <2.0.0', '>=1.0.0 <2.0.0'],
  ['exact version', '1.2.3', '1.2.3'],
  ['explicit any', 'any', 'any'],
  ['unconstrained dependency', null, 'any'],
  [
    'hosted dependency',
    { hosted: 'https://example.com', version: '^1.2.3' },
    '^1.2.3',
  ],
  [
    'legacy hosted dependency',
    { hosted: { name: 'dep', url: 'https://example.com' }, version: '^1.2.3' },
    '^1.2.3',
  ],
  ['SDK dependency', { sdk: 'flutter' }, 'any'],
  [
    'SDK dependency with constraint',
    { sdk: 'flutter', version: '>=1.0.0' },
    '>=1.0.0',
  ],
  ['mapping without constraint', {}, 'any'],
  ['mapping with null constraint', { version: null }, 'any'],
]) {
  t.create(name)
    .get('/example/dep.json')
    .intercept(nock =>
      nock('https://pub.dev')
        .get('/api/packages/example')
        .reply(200, {
          latest: { pubspec: { dependencies: { dep: requirement } } },
        }),
    )
    .expectBadge({ label: 'dep', message, color: 'blue' })
}

for (const [name, pubspec] of [
  ['missing dependency', { dependencies: { other: '^1.0.0' } }],
  ['absent dependencies', {}],
  ['null dependencies', { dependencies: null }],
  ['empty dependencies', { dependencies: {} }],
  ['development dependency only', { dev_dependencies: { dep: '^1.0.0' } }],
]) {
  t.create(name)
    .get('/example/dep.json')
    .intercept(nock =>
      nock('https://pub.dev')
        .get('/api/packages/example')
        .reply(200, { latest: { pubspec } }),
    )
    .expectBadge({
      label: 'dependency version',
      message: 'version requirement not found',
    })
}

for (const dependency of ['constructor', 'toString', '__proto__']) {
  t.create(`inherited property ${dependency} is not a dependency`)
    .get(`/example/${dependency}.json`)
    .intercept(nock =>
      nock('https://pub.dev')
        .get('/api/packages/example')
        .reply(200, { latest: { pubspec: { dependencies: {} } } }),
    )
    .expectBadge({
      label: 'dependency version',
      message: 'version requirement not found',
    })
}

for (const [name, body] of [
  ['missing latest', {}],
  ['missing pubspec', { latest: {} }],
  ['invalid dependencies', { latest: { pubspec: { dependencies: [] } } }],
  ...[
    '',
    42,
    false,
    [],
    { version: '' },
    { version: 42 },
    { version: false },
    { version: [] },
  ].map((dep, i) => [
    `invalid dependency ${i}`,
    { latest: { pubspec: { dependencies: { dep } } } },
  ]),
]) {
  t.create(name)
    .get('/example/dep.json')
    .intercept(nock =>
      nock('https://pub.dev').get('/api/packages/example').reply(200, body),
    )
    .expectBadge({
      label: 'dependency version',
      message: 'invalid response data',
    })
}

t.create('package not found')
  .get('/example/dep.json')
  .intercept(nock =>
    nock('https://pub.dev').get('/api/packages/example').reply(404),
  )
  .expectBadge({ label: 'dependency version', message: 'not found' })
