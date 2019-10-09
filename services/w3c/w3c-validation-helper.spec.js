'use strict'
const { expect } = require('chai')
const {
  presetRegex,
  getMessage,
  getColor,
  getSchema,
} = require('./w3c-validation-helper')

describe('w3c-validation-helper', function() {
  describe('presetRegex', function() {
    const presetTests = [
      { preset: 'html,svg 1.1,mathml 3.0', expectedResult: true },
      { preset: 'HTML,SVG 1.1,MathML 3.0', expectedResult: true },
      { preset: 'HTML, SVG 1.1, MathML 3.0', expectedResult: true },
      { preset: 'HTML , SVG 1.1 , MathML 3.0', expectedResult: true },
      { preset: 'HTML,SVG 1.1,MathML 3.0,ITS 2.0', expectedResult: true },
      { preset: 'HTML, SVG 1.1, MathML 3.0, ITS 2.0', expectedResult: true },
      { preset: 'HTML , SVG 1.1 , MathML 3.0 , ITS 2.0', expectedResult: true },
      { preset: 'HTML,SVG 1.1,MathML 3.0,RDFa Lite 1.1', expectedResult: true },
      {
        preset: 'HTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1',
        expectedResult: true,
      },
      {
        preset: 'HTML , SVG 1.1 , MathML 3.0 , RDFa Lite 1.1',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Strict,URL/XHTML 1.0 Strict,URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Strict, URL/ XHTML 1.0 Strict, URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Strict , URL / XHTML 1.0 Strict , URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Transitional,URL/XHTML 1.0 Transitional,URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Transitional, URL/ XHTML 1.0 Transitional, URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Transitional , URL / XHTML 1.0 Transitional , URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Frameset,URL/XHTML 1.0 Frameset,URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Frameset, URL/ XHTML 1.0 Frameset, URL',
        expectedResult: true,
      },
      {
        preset: 'HTML 4.01 Frameset , URL / XHTML 1.0 Frameset , URL',
        expectedResult: true,
      },
      { preset: 'XHTML,SVG 1.1,MathML 3.0', expectedResult: true },
      { preset: 'XHTML, SVG 1.1, MathML 3.0', expectedResult: true },
      { preset: 'XHTML , SVG 1.1 , MathML 3.0', expectedResult: true },
      {
        preset: 'XHTML,SVG 1.1,MathML 3.0,RDFa Lite 1.1',
        expectedResult: true,
      },
      {
        preset: 'XHTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1',
        expectedResult: true,
      },
      {
        preset: 'XHTML , SVG 1.1 , MathML 3.0 , RDFa Lite 1.1',
        expectedResult: true,
      },
      {
        preset: 'XHTML 1.0 Strict,URL,Ruby,SVG 1.1,MathML 3.0',
        expectedResult: true,
      },
      {
        preset: 'XHTML 1.0 Strict, URL, Ruby, SVG 1.1, MathML 3.0',
        expectedResult: true,
      },
      {
        preset: 'XHTML 1.0 Strict , URL , Ruby , SVG 1.1 , MathML 3.0',
        expectedResult: true,
      },
      { preset: 'SVG 1.1,URL,XHTML,MathML 3.0', expectedResult: true },
      { preset: 'SVG 1.1, URL, XHTML, MathML 3.0', expectedResult: true },
      { preset: 'SVG 1.1 , URL , XHTML , MathML 3.0', expectedResult: true },
      { preset: undefined, expectedResult: false },
      { preset: null, expectedResult: false },
      { preset: '', expectedResult: false },
      { preset: 'html', expectedResult: false },
    ]

    presetTests.forEach(test => {
      const { preset, expectedResult } = test
      it(`should return ${expectedResult} for ${preset}`, function() {
        const actualResult = presetRegex.test(preset)

        expect(actualResult).to.equal(expectedResult)
      })
    })
  })

  describe('getColor', function() {
    it('returns "brightgreen" if no messages are provided', function() {
      const messageTypes = {}

      const actualResult = getColor(messageTypes)

      expect(actualResult).to.equal('brightgreen')
    })

    it('returns "yellow" if only warning messages are provided', function() {
      const messageTypes = { warning: 1 }

      const actualResult = getColor(messageTypes)

      expect(actualResult).to.equal('yellow')
    })

    it('returns "red" if only error messages are provided', function() {
      const messageTypes = { error: 1 }

      const actualResult = getColor(messageTypes)

      expect(actualResult).to.equal('red')
    })

    it('returns "red" if both warning and error messages are provided', function() {
      const messageTypes = { warning: 3, error: 4 }

      const actualResult = getColor(messageTypes)

      expect(actualResult).to.equal('red')
    })
  })

  describe('getMessage', function() {
    it('returns "validate" if no messages are provided', function() {
      const messageTypes = {}

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('validated')
    })

    it('returns "1 error" if 1 error message is provided', function() {
      const messageTypes = { error: 1 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('1 error')
    })

    it('returns "2 errors" if 2 error messages are provided', function() {
      const messageTypes = { error: 2 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('2 errors')
    })

    it('returns "1 warning" if 1 warning message is provided', function() {
      const messageTypes = { warning: 1 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('1 warning')
    })

    it('returns "2 warnings" if 2 warning messages are provided', function() {
      const messageTypes = { warning: 2 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('2 warnings')
    })

    it('returns "1 error, 1 warning" if 1 error and 1 warning message is provided', function() {
      const messageTypes = { warning: 1, error: 1 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('1 error, 1 warning')
    })

    it('returns "2 errors, 2 warnings" if 2 error and 2 warning message is provided', function() {
      const messageTypes = { error: 2, warning: 2 }

      const actualResult = getMessage(messageTypes)

      expect(actualResult).to.equal('2 errors, 2 warnings')
    })
  })

  describe('getSchema', function() {
    const emptyPresetTests = [undefined, null, '']
    emptyPresetTests.forEach(preset => {
      it(`should return "undefined" for ${preset}`, function() {
        const actualResult = getSchema(preset)

        expect(actualResult).to.equal(undefined)
      })
    })

    it('returns an empty schema if no preset is provided', function() {
      const preset = ''

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(undefined)
    })

    it('returns 3 schemas associated to the "HTML,SVG 1.1,MathML 3.0" preset', function() {
      const preset = 'HTML,SVG 1.1,MathML 3.0'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/html5.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })

    it('returns 3 schemas associated to the "HTML,SVG 1.1,MathML 3.0,ITS 2.0" preset', function() {
      const preset = 'HTML,SVG 1.1,MathML 3.0,ITS 2.0'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/html5-its.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })

    it('returns 3 schemas associated to the "HTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1" preset', function() {
      const preset = 'HTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/html5-rdfalite.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })

    it('returns 3 schemas associated to the "HTML 4.01 Strict, URL/ XHTML 1.0 Strict, URL" preset', function() {
      const preset = 'HTML 4.01 Strict, URL/ XHTML 1.0 Strict, URL'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml10/xhtml-strict.rnc http://s.validator.nu/html4/assertions.sch http://c.validator.nu/all-html4/'
      )
    })

    it('returns 3 schemas associated to the "HTML 4.01 Transitional, URL/ XHTML 1.0 Transitional, URL" preset', function() {
      const preset = 'HTML 4.01 Transitional, URL/ XHTML 1.0 Transitional, URL'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml10/xhtml-transitional.rnc http://s.validator.nu/html4/assertions.sch http://c.validator.nu/all-html4/'
      )
    })

    it('returns 3 schemas associated to the "HTML 4.01 Frameset, URL/ XHTML 1.0 Frameset, URL" preset', function() {
      const preset = 'HTML 4.01 Frameset, URL/ XHTML 1.0 Frameset, URL'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml10/xhtml-frameset.rnc http://s.validator.nu/html4/assertions.sch http://c.validator.nu/all-html4/'
      )
    })

    it('returns 3 schemas associated to the "XHTML, SVG 1.1, MathML 3.0" preset', function() {
      const preset = 'XHTML, SVG 1.1, MathML 3.0'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml5.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })

    it('returns 3 schemas associated to the "XHTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1" preset', function() {
      const preset = 'XHTML, SVG 1.1, MathML 3.0, RDFa Lite 1.1'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml5-rdfalite.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })

    it('returns 3 schemas associated to the "XHTML 1.0 Strict, URL, Ruby, SVG 1.1, MathML 3.0" preset', function() {
      const preset = 'XHTML 1.0 Strict, URL, Ruby, SVG 1.1, MathML 3.0'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/xhtml1-ruby-rdf-svg-mathml.rnc http://s.validator.nu/html4/assertions.sch http://c.validator.nu/all-html4/'
      )
    })

    it('returns 3 schemas associated to the "SVG 1.1, URL, XHTML, MathML 3.0" preset', function() {
      const preset = 'SVG 1.1, URL, XHTML, MathML 3.0'

      const actualResult = getSchema(preset)

      expect(actualResult).to.equal(
        'http://s.validator.nu/svg-xhtml5-rdf-mathml.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/'
      )
    })
  })
})
