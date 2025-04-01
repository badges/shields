import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

////////// OK tests //////////

t.create('Regex search')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=unblocking \\[.*\\]',
  )
  .expectBadge({
    label: 'match',
    message: 'unblocking [#4947]',
    color: 'blue',
  })

t.create('Regex search and replace')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=unblocking \\[(.*)\\]&replace=$1',
  )
  .expectBadge({
    label: 'match',
    message: '#4947',
    color: 'blue',
  })

t.create('Regex search with flags')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=questions.*providing&flags=s',
  )
  .expectBadge({
    label: 'match',
    message: 'questions.\n- providing',
    color: 'blue',
  })

t.create('No matched search')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=notfound',
  )
  .expectBadge({
    label: 'match',
    message: '',
    color: 'blue',
  })

t.create('Custom no matched search')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=notfound&noMatch=Not found',
  )
  .expectBadge({
    label: 'match',
    message: 'Not found',
    color: 'blue',
  })

t.create('Avoid ReDoS check')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=(-%2B)%2B0&noMatch=none',
  )
  .expectBadge({
    label: 'match',
    message: 'none',
    color: 'blue',
  })

////////// KO tests //////////

t.create('No URL specified').get('.json?search=.*&label=Found').expectBadge({
  label: 'Found',
  message: 'invalid query parameter: url',
  color: 'red',
})

t.create('No search specified')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/README.md&label=Found',
  )
  .expectBadge({
    label: 'Found',
    message: 'invalid query parameter: search',
    color: 'red',
  })

t.create('Invalid url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&search=.*',
  )
  .expectBadge({
    label: 'match',
    message: 'not found',
    color: 'red',
  })

////////// generic //////////

t.create('Malformed url')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/%0README.md&search=.*&label=Found',
  )
  .expectBadge({
    label: 'Found',
    message: 'invalid',
    color: 'lightgrey',
  })

t.create('User color overrides default')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=unblocking \\[.*\\]&color=10ADED',
  )
  .expectBadge({
    label: 'match',
    message: 'unblocking [#4947]',
    color: '#10aded',
  })

t.create('Error color overrides default')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&search=$1',
  )
  .expectBadge({
    label: 'match',
    message: 'not found',
    color: 'red',
  })

t.create('Error color overrides user specified')
  .get('.json?search=$1&color=10ADED')
  .expectBadge({
    label: 'match',
    message: 'invalid query parameter: url',
    color: 'red',
  })
