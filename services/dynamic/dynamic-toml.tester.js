import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('No URL specified')
  .get('.json?query=$.name&label=Package Name')
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: url',
    color: 'red',
  })

t.create('No query specified')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&label=Package Name',
  )
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: query',
    color: 'red',
  })

t.create('TOML from url')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.title',
  )
  .expectBadge({
    label: 'custom badge',
    message: 'TOML Example',
    color: 'blue',
  })

t.create('TOML from url | multiple results')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.database.data[0][*]',
  )
  .expectBadge({ label: 'custom badge', message: 'delta, phi' })

t.create('TOML from url | caching with new query params')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.owner.name',
  )
  .expectBadge({ label: 'custom badge', message: 'Tom Preston-Werner' })

t.create('TOML from url | with prefix & suffix & label')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.database.temp_targets.cpu&prefix=%2B&suffix=%C2%B0C&label=CPU Temp Target',
  )
  .expectBadge({ label: 'CPU Temp Target', message: '+79.5°C' })

t.create('TOML from url | object doesnt exist')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.does_not_exist',
  )
  .expectBadge({
    label: 'custom badge',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('TOML from url | invalid url')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/not-a-file.toml&query=$.version',
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('TOML from url | user color overrides default')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml&query=$.title&color=10ADED',
  )
  .expectBadge({
    label: 'custom badge',
    message: 'TOML Example',
    color: '#10aded',
  })

t.create('TOML from url | error color overrides default')
  .get(
    '.json?url=https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/not-a-file.toml&query=$.version',
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('TOML from url | error color overrides user specified')
  .get('.json?query=$.version&color=10ADED')
  .expectBadge({
    label: 'custom badge',
    message: 'invalid query parameter: url',
    color: 'red',
  })

t.create('TOML contains a string')
  .get('.json?url=https://example.test/toml&query=$.foo,')
  .intercept(nock =>
    nock('https://example.test').get('/toml').reply(200, '"foo"'),
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable toml response',
    color: 'lightgrey',
  })
