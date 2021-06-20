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
        })
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
      }
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
  })
})
