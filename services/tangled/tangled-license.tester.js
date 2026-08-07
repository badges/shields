import { licenseToColor } from '../licenses.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const mitColor = licenseToColor('MIT')
const apacheColor = licenseToColor('Apache-2.0')
const gplColor = licenseToColor('GPL-3.0')

const MIT_BODY = `MIT License

Copyright (c) 2024 Example

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction,`

const APACHE_BODY = `                                 Apache License, Version 2.0
                           TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION`
const GPL3_BODY = `                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007`

t.create('MIT license')
  .get('/testowner/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/testrepo/raw/HEAD/LICENSE')
      .reply(200, MIT_BODY),
  )
  .expectBadge({ label: 'license', message: 'MIT', color: mitColor })

t.create('Apache-2.0 license')
  .get('/testowner/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/testrepo/raw/HEAD/LICENSE')
      .reply(200, APACHE_BODY),
  )
  .expectBadge({ label: 'license', message: 'Apache-2.0', color: apacheColor })

t.create('GPL-3.0 license')
  .get('/testowner/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/testrepo/raw/HEAD/LICENSE')
      .reply(200, GPL3_BODY),
  )
  .expectBadge({ label: 'license', message: 'GPL-3.0', color: gplColor })

t.create('unrecognised license body')
  .get('/testowner/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/testrepo/raw/HEAD/LICENSE')
      .reply(200, 'All rights reserved. Proprietary and confidential.'),
  )
  .expectBadge({ label: 'license', message: 'unknown', color: 'lightgrey' })

t.create('falls through to LICENSE.md when LICENSE is absent')
  .get('/testowner/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/testrepo/raw/HEAD/LICENSE')
      .reply(404)
      .get('/testowner/testrepo/raw/HEAD/LICENSE.md')
      .reply(200, MIT_BODY),
  )
  .expectBadge({ label: 'license', message: 'MIT', color: mitColor })

t.create('no license file found')
  .get('/testowner/nolicense.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/testowner/nolicense/raw/HEAD/LICENSE')
      .reply(404)
      .get('/testowner/nolicense/raw/HEAD/LICENSE.md')
      .reply(404)
      .get('/testowner/nolicense/raw/HEAD/LICENSE.txt')
      .reply(404)
      .get('/testowner/nolicense/raw/HEAD/COPYING')
      .reply(404)
      .get('/testowner/nolicense/raw/HEAD/COPYING.md')
      .reply(404),
  )
  .expectBadge({
    label: 'license',
    message: 'not specified',
    color: 'lightgrey',
  })

t.create('dotted owner handle (e.g. icyphox.sh)')
  .get('/icyphox.sh/testrepo.json')
  .intercept(nock =>
    nock('https://tangled.org')
      .get('/icyphox.sh/testrepo/raw/HEAD/LICENSE')
      .reply(200, MIT_BODY),
  )
  .expectBadge({ label: 'license', message: 'MIT', color: mitColor })
