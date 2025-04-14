import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

////////// OK tests //////////

t.create('Search only')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=unblocking \\[.*\\]',
  )
  .expectBadge({
    label: 'match',
    message: 'unblocking [#4947]',
    color: 'blue',
  })

t.create('Search & replace with flags')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=Unblocking \\[(.*)\\]&replace=$1&flags=i',
  )
  .expectBadge({
    label: 'match',
    message: '#4947',
    color: 'blue',
  })

////////// KO tests (specific) //////////

t.create('No result')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=notfound',
  )
  .expectBadge({
    label: 'match',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('Invalid Regex')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=x(%3F%3Dy)',
  )
  .expectBadge({
    label: 'match',
    message: 'Invalid re2 regex: invalid perl operator: (?=',
    color: 'red',
  })

t.create('Invalid flags')
  .get(
    '.json?url=https://raw.githubusercontent.com/badges/shields/refs/heads/master/frontend/blog/2024-07-10-sunsetting-shields-custom-logos.md&search=questions.*providing&flags=s0',
  )
  .expectBadge({
    label: 'match',
    message: 'Invalid flags, must be one of: ims',
    color: 'red',
  })

////////// KO tests (common) //////////

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
    message: 'resource not found',
    color: 'red',
  })

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
    message: 'resource not found',
    color: 'red',
  })

t.create('Error color overrides user specified')
  .get('.json?search=$1&color=10ADED')
  .expectBadge({
    label: 'match',
    message: 'invalid query parameter: url',
    color: 'red',
  })
