import queryString from 'query-string'
import { createServiceTester } from '../tester.js'
import { exampleXml } from './dynamic-response-fixtures.js'
export const t = await createServiceTester()

const exampleUrl = 'https://example.test/example.xml'
const withExampleXml = nock =>
  nock('https://example.test').get('/example.xml').reply(200, exampleXml)

t.create('No URL specified')
  .get('.json?query=//name&label=Package Name')
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: url',
    color: 'red',
  })

t.create('No query specified')
  .get('.json?url=https://example.test/example.xml&label=Package Name')
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: query',
    color: 'red',
  })

t.create('XML from url')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: "//book[@id='bk102']/title",
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'Midnight Rain',
    color: 'blue',
  })

t.create('uri query parameter alias')
  .get(
    `.json?${queryString.stringify({
      uri: exampleUrl,
      query: "//book[@id='bk102']/title",
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'Midnight Rain',
    color: 'blue',
  })

t.create('attribute')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//book[2]/@id',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'bk102',
  })

t.create('multiple results')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//book/title',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message:
      "XML Developer's Guide, Midnight Rain, Maeve Ascendant, Oberon's Legacy, The Sundered Grail, Lover Birds, Splish Splash, Creepy Crawlies, Paradox Lost, Microsoft .NET: The Programming Bible, MSXML3: A Comprehensive Guide, Visual Studio 7: A Comprehensive Guide",
  })

t.create('prefix and suffix')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: "//book[@id='bk102']/title",
      prefix: 'title is ',
      suffix: ', innit',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    message: 'title is Midnight Rain, innit',
  })

t.create('query doesnt exist')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//does/not/exist',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('query doesnt exist (attribute)')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//does/not/@exist',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('Cannot resolve QName')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//a:si',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'Cannot resolve QName a',
    color: 'red',
  })

t.create('XPath parse error')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//a[contains(@href, "foo"]',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: 'XPath parse error',
    color: 'red',
  })

t.create('XML from url | invalid url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.xml&query=//version'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('request should set Accept header')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: "//book[@id='bk102']/title",
    })}`
  )
  .intercept(nock =>
    nock('https://example.test', {
      reqheaders: { accept: 'application/xml, text/xml' },
    })
      .get('/example.xml')
      .reply(200, exampleXml)
  )
  .expectBadge({ label: 'custom badge', message: 'Midnight Rain' })

t.create('query with node function')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: '//book[1]/title/text()',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: "XML Developer's Guide",
    color: 'blue',
  })

t.create('query with type conversion to string')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: 'string(//book[1]/title)',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: "XML Developer's Guide",
    color: 'blue',
  })

t.create('query with type conversion to number')
  .get(
    `.json?${queryString.stringify({
      url: exampleUrl,
      query: 'number(//book[1]/price)',
    })}`
  )
  .intercept(withExampleXml)
  .expectBadge({
    label: 'custom badge',
    message: '44.95',
    color: 'blue',
  })
