'use strict'

const { test, given } = require('sazerac')
const { XmlElement } = require('./xml')

function testRender(params) {
  return new XmlElement(params).render()
}

describe('XmlElement class', function () {
  test(testRender, () => {
    given({ name: 'tag' }).expect('<tag/>')

    given({ name: 'tag', content: ['text'] }).expect('<tag>text</tag>')

    given({
      name: 'tag',
      content: ['not xml>>>', 'text', new XmlElement({ name: 'xml' })],
    }).expect('<tag>not xml&gt;&gt;&gt; text <xml/></tag>')

    given({
      name: 'nested1',
      content: [
        new XmlElement({
          name: 'nested2',
          content: [new XmlElement({ name: 'nested3' })],
        }),
      ],
    }).expect('<nested1><nested2><nested3/></nested2></nested1>')

    given({
      name: 'tag',
      attrs: {
        int: 47,
        text: 'text',
        escape: '<escape me>',
      },
    }).expect('<tag int="47" text="text" escape="&lt;escape me&gt;"/>')

    given({
      name: 'tag',
      content: ['text'],
      attrs: {
        int: 47,
        text: 'text',
        escape: '<escape me>',
      },
    }).expect('<tag int="47" text="text" escape="&lt;escape me&gt;">text</tag>')
  })
})
