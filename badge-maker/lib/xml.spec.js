'use strict'

const { test, given } = require('sazerac')
const { XmlElement } = require('./xml')

function testRender(params) {
  return new XmlElement(params).render()
}

describe('XmlElement class', function () {
  test(testRender, () => {
    given({ tag: 'tag' }).expect('<tag/>')

    given({ tag: 'tag', content: ['text'] }).expect('<tag>text</tag>')

    given({
      tag: 'tag',
      content: ['not xml>>>', 'text', new XmlElement({ tag: 'xml' })],
    }).expect('<tag>not xml&gt;&gt;&gt; text <xml/></tag>')

    given({
      tag: 'nested1',
      content: [
        new XmlElement({
          tag: 'nested2',
          content: [new XmlElement({ tag: 'nested3' })],
        }),
      ],
    }).expect('<nested1><nested2><nested3/></nested2></nested1>')

    given({
      tag: 'tag',
      attrs: {
        int: 47,
        text: 'text',
        escape: '<escape me>',
      },
    }).expect('<tag int="47" text="text" escape="&lt;escape me&gt;"/>')

    given({
      tag: 'tag',
      content: ['text'],
      attrs: {
        int: 47,
        text: 'text',
        escape: '<escape me>',
      },
    }).expect('<tag int="47" text="text" escape="&lt;escape me&gt;">text</tag>')
  })
})
