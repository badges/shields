import { expect } from 'chai'
import sinon from 'sinon'
import xpath from 'xpath'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import DynamicXml from './dynamic-xml.service.js'

const exampleXml = `<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <title>XML Developer's Guide</title>
      <price>44.95</price>
      <genre>Computer</genre>
   </book>
   <book id="bk102">
      <title>Midnight Rain</title>
      <price>5.95</price>
      <genre></genre>
   </book>
</catalog>
`

const exampleHtml = `<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
      <h1>Herman Melville - Moby-Dick</h1>
      <div>
        <p>
          Availing himself of the mild, summer-cool weather that now reigned in these
          latitudes, and in preparation for the peculiarly active pursuits shortly to
          be anticipated, Perth, the begrimed, blistered old blacksmith, had not
          removed his portable forge to the hold again, after concluding his
          contributory work for Ahab's leg, but still retained it on deck, fast lashed
          to ringbolts by the foremast; being now almost incessantly invoked by the
          headsmen, and harpooneers, and bowsmen to do some little job for them;
          altering, or repairing, or new shaping their various weapons and boat
          furniture.
        </p>
      </div>
  </body>
</html>
`

describe('DynamicXml', function () {
  describe('transform()', function () {
    beforeEach(function () {
      sinon.stub(xpath, 'select').returns(undefined)
    })

    afterEach(function () {
      sinon.restore()
    })

    it('throws InvalidResponse on unsupported query', function () {
      expect(() =>
        DynamicXml.prototype.transform({
          pathExpression: '//book/title',
          buffer: exampleXml,
        }),
      )
        .to.throw(InvalidResponse)
        .with.property('prettyMessage', 'unsupported query')
    })
  })

  test(DynamicXml.prototype.transform, () => {
    given({
      pathExpression: '//book[1]/title/text()',
      buffer: exampleXml,
    }).expect({
      values: ["XML Developer's Guide"],
    })
    given({ pathExpression: '//book/title/text()', buffer: exampleXml }).expect(
      {
        values: ["XML Developer's Guide", 'Midnight Rain'],
      },
    )
    given({
      pathExpression: 'string(//book[1]/title)',
      buffer: exampleXml,
    }).expect({
      values: ["XML Developer's Guide"],
    })
    given({
      pathExpression: 'string(//book/title)',
      buffer: exampleXml,
    }).expect({
      values: ["XML Developer's Guide"],
    })
    given({
      pathExpression: 'string(//book[1]/@id)',
      buffer: exampleXml,
    }).expect({
      values: ['bk101'],
    })
    given({
      pathExpression: 'substring(//book[1]/title, 5, 9)',
      buffer: exampleXml,
    }).expect({
      values: ['Developer'],
    })
    given({
      pathExpression: 'number(//book[1]/price)',
      buffer: exampleXml,
    }).expect({
      values: [44.95],
    })
    given({
      pathExpression: 'boolean(string(//book[1]/genre))',
      buffer: exampleXml,
    }).expect({
      values: [true],
    })
    given({
      pathExpression: 'boolean(string(//book[2]/genre))',
      buffer: exampleXml,
    }).expect({
      values: [false],
    })
    given({
      pathExpression: 'count(//book)',
      buffer: exampleXml,
    }).expect({
      values: [2],
    })
    given({
      pathExpression: 'floor(//book[1]/price)',
      buffer: exampleXml,
    }).expect({
      values: [44],
    })
    given({
      pathExpression: "//p[lang('en')]",
      buffer: '<p xml:lang="en">Midnight Rain</p>',
    }).expect({
      values: ['Midnight Rain'],
    })
    given({
      pathExpression: 'normalize-space(string(/title))',
      buffer: '<title> Midnight  Rain   </title>',
    }).expect({
      values: ['Midnight Rain'],
    })
    given({
      pathExpression: '//book[1]/title | //book[1]/price',
      buffer: exampleXml,
    }).expect({
      values: ["XML Developer's Guide", '44.95'],
    })
    given({
      pathExpression: '//h1[1]',
      buffer: exampleHtml,
      contentType: 'text/html',
    }).expect({
      values: ['Herman Melville - Moby-Dick'],
    })

    // lowercase doctype
    // https://github.com/badges/shields/issues/10827
    given({
      pathExpression: '//h1[1]',
      buffer: exampleHtml.replace('<!DOCTYPE html>', '<!doctype html>'),
      contentType: 'text/html',
    }).expect({
      values: ['Herman Melville - Moby-Dick'],
    })
  })

  test(DynamicXml.prototype.getmimeType, () => {
    // known types
    given('text/html').expect('text/html')
    given('application/xml').expect('application/xml')
    given('application/xhtml+xml').expect('application/xhtml+xml')
    given('image/svg+xml').expect('image/svg+xml')

    // with character set
    given('text/html; charset=utf-8').expect('text/html')

    // should fall back to text/xml if mime type is not one of the known types
    given('text/csv').expect('text/xml')
    given('foobar').expect('text/xml')
  })
})
