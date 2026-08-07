import { expect } from 'chai'
import {
  formatStaticBadgePath,
  parseStaticBadgePath,
} from './static-badge-path.js'

describe('Static badge path', function () {
  describe('parseStaticBadgePath', function () {
    it('parses label, message, color, and format', function () {
      expect(
        parseStaticBadgePath('/badge/best--license-Apache--2.0-blue.json'),
      ).to.deep.equal({
        label: 'best-license',
        message: 'Apache-2.0',
        color: 'blue',
        format: 'json',
      })
    })

    it('defaults to SVG when the extension is omitted', function () {
      expect(parseStaticBadgePath('/badge/build-passing-green')).to.deep.equal({
        label: 'build',
        message: 'passing',
        color: 'green',
        format: 'svg',
      })
    })

    it('parses a badge without a label', function () {
      expect(
        parseStaticBadgePath('/badge/all%20one%20color-red.svg'),
      ).to.deep.equal({
        label: '',
        message: 'all one color',
        color: 'red',
        format: 'svg',
      })
    })

    it('parses a badge without a message', function () {
      expect(parseStaticBadgePath('/badge/label--blue.svg')).to.deep.equal({
        label: 'label',
        message: '',
        color: 'blue',
        format: 'svg',
      })
    })

    it('decodes underscores and percent-encoded path characters', function () {
      expect(
        parseStaticBadgePath('/badge/a__label-a%2Fb_c-%23123.svg'),
      ).to.deep.equal({
        label: 'a_label',
        message: 'a/b c',
        color: '#123',
        format: 'svg',
      })
    })

    it('supports the legacy colon syntax', function () {
      expect(parseStaticBadgePath('/:label-message-blue.json')).to.deep.equal({
        label: 'label',
        message: 'message',
        color: 'blue',
        format: 'json',
      })
    })

    it('does not decode a pathname twice when a router decoded it', function () {
      expect(
        parseStaticBadgePath('/badge/label-100%25-blue.svg', {
          isDecoded: true,
        }),
      ).to.deep.equal({
        label: 'label',
        message: '100%25',
        color: 'blue',
        format: 'svg',
      })
    })

    it('applies query-string overrides and preserves other parameters', function () {
      expect(
        parseStaticBadgePath(
          '/badge/path--label-message-blue.svg?label=query+label&color=red&style=flat-square&link=https%3A%2F%2Fexample.com%2Fa&link=https%3A%2F%2Fexample.com%2Fb',
        ),
      ).to.deep.equal({
        label: 'query label',
        message: 'message',
        color: 'red',
        format: 'svg',
        queryParams: {
          label: 'query label',
          color: 'red',
          style: 'flat-square',
          link: ['https://example.com/a', 'https://example.com/b'],
        },
      })
    })

    it('supports legacy color overrides with modern color taking precedence', function () {
      expect(
        parseStaticBadgePath(
          '/badge/label-message-blue.json?colorB=yellow&color=orange',
        ),
      ).to.include({ color: 'orange' })
      expect(
        parseStaticBadgePath('/badge/label-message-blue.json?colorB=yellow'),
      ).to.include({ color: 'yellow' })
    })

    it('does not treat encoded query delimiters as a query string', function () {
      expect(
        parseStaticBadgePath('/badge/label-what%3Fcolor%3Dred-blue.svg'),
      ).to.deep.equal({
        label: 'label',
        message: 'what?color=red',
        color: 'blue',
        format: 'svg',
      })
    })

    it('returns undefined for non-static and malformed paths', function () {
      expect(parseStaticBadgePath('/github/stars/badges/shields')).to.be
        .undefined
      expect(parseStaticBadgePath('/badge/missingcolor')).to.be.undefined
      expect(parseStaticBadgePath('/badge/label-message-blue.png')).to.be
        .undefined
      expect(parseStaticBadgePath('/badge/bad%escape-red.svg')).to.be.undefined
    })
  })

  describe('formatStaticBadgePath', function () {
    it('formats a canonical static badge pathname', function () {
      expect(
        formatStaticBadgePath({
          label: 'best-license',
          message: 'Apache-2.0',
          color: '#123',
          format: 'json',
        }),
      ).to.equal('/badge/best--license-Apache--2.0-%23123.json')
    })

    it('omits the label segment when the label is empty', function () {
      expect(
        formatStaticBadgePath({ message: 'all one color', color: 'red' }),
      ).to.equal('/badge/all%20one%20color-red.svg')
    })

    it('round trips path-significant characters', function () {
      const badge = {
        label: 'a_label-value',
        message: 'a/b 100%',
        color: 'rgb(1, 2, 3)',
        format: 'json',
      }

      expect(parseStaticBadgePath(formatStaticBadgePath(badge))).to.deep.equal(
        badge,
      )
    })

    it('round trips adjacent spaces and underscores without ambiguity', function () {
      const badge = {
        label: ' _',
        message: 'a _b_ ',
        color: 'blue',
        format: 'svg',
      }

      expect(parseStaticBadgePath(formatStaticBadgePath(badge))).to.deep.equal(
        badge,
      )
    })

    it('formats and round trips query parameters', function () {
      const badge = {
        label: 'query label',
        message: 'message',
        color: 'red',
        format: 'svg',
        queryParams: {
          label: 'query label',
          color: 'red',
          style: 'flat-square',
          link: ['https://example.com/a', 'https://example.com/b'],
        },
      }

      const path = formatStaticBadgePath(badge)
      expect(path).to.equal(
        '/badge/query%20label-message-red.svg?label=query+label&color=red&style=flat-square&link=https%3A%2F%2Fexample.com%2Fa&link=https%3A%2F%2Fexample.com%2Fb',
      )
      expect(parseStaticBadgePath(path)).to.deep.equal(badge)
    })

    it('uses query overrides for values the path grammar cannot represent', function () {
      const badge = {
        label: 'trailing-',
        message: 'message',
        color: 'rgb(.5 0 0)',
        format: 'json',
        queryParams: {
          label: 'trailing-',
          color: 'rgb(.5 0 0)',
        },
      }

      const path = formatStaticBadgePath(badge)
      expect(path).to.equal(
        '/badge/message-lightgrey.json?label=trailing-&color=rgb%28.5+0+0%29',
      )
      expect(parseStaticBadgePath(path)).to.deep.equal(badge)
    })

    it('rejects invalid inputs', function () {
      expect(() =>
        formatStaticBadgePath({ message: 'message', color: '' }),
      ).to.throw(TypeError, 'color must be a non-empty string')
      expect(() =>
        formatStaticBadgePath({ message: 'message', color: 'blue-green' }),
      ).to.throw(TypeError, 'color cannot contain dots or dashes')
      expect(() =>
        formatStaticBadgePath({
          label: 'trailing-',
          message: 'message',
          color: 'blue',
        }),
      ).to.throw(
        TypeError,
        'label cannot end with a dash in the static badge path',
      )
      expect(() =>
        formatStaticBadgePath({
          message: 'message',
          color: 'blue',
          format: 'png',
        }),
      ).to.throw(TypeError, "format must be either 'svg' or 'json'")
    })
  })
})
