'use strict'

const { expect } = require('chai')
const { getShieldsIcon, getSimpleIcon } = require('../../lib/logos')
const coalesceBadge = require('./coalesce-badge')

describe('coalesceBadge', function() {
  describe('Label', function() {
    it('uses the default label', function() {
      expect(coalesceBadge({}, {}, { label: 'heyo' }).text).to.deep.equal([
        'heyo',
        'n/a',
      ])
    })

    // This behavior isn't great and we might want to remove it.
    it('uses the category as a default label', function() {
      expect(
        coalesceBadge({}, {}, {}, { category: 'cat' }).text
      ).to.deep.equal(['cat', 'n/a'])
    })

    it('preserves an empty label', function() {
      expect(
        coalesceBadge({}, { label: '', message: '10k' }, {}).text
      ).to.deep.equal(['', '10k'])
    })

    it('overrides the label', function() {
      expect(
        coalesceBadge({ label: 'purr count' }, { label: 'purrs' }, {}).text
      ).to.deep.equal(['purr count', 'n/a'])
    })
  })

  describe('Message', function() {
    it('applies the service message', function() {
      expect(coalesceBadge({}, { message: '10k' }, {}).text).to.deep.equal([
        undefined,
        '10k',
      ])
    })

    it('applies a numeric service message', function() {
      // While a number of badges use this, in the long run we may want
      // `render()` to always return a string.
      expect(coalesceBadge({}, { message: 10 }, {}).text).to.deep.equal([
        undefined,
        10,
      ])
    })
  })

  describe('Right color', function() {
    it('uses the default color', function() {
      expect(coalesceBadge({}, {}, {}).color).to.equal('lightgrey')
    })

    it('overrides the color', function() {
      expect(
        coalesceBadge({ color: '10ADED' }, { color: 'red' }, {}).color
      ).to.equal('10ADED')
      // also expected for legacy name
      expect(
        coalesceBadge({ colorB: 'B0ADED' }, { color: 'red' }, {}).color
      ).to.equal('B0ADED')
    })

    context('In case of an error', function() {
      it('does not override the color', function() {
        expect(
          coalesceBadge(
            { color: '10ADED' },
            { isError: true, color: 'lightgray' },
            {}
          ).color
        ).to.equal('lightgray')
        // also expected for legacy name
        expect(
          coalesceBadge(
            { colorB: 'B0ADED' },
            { isError: true, color: 'lightgray' },
            {}
          ).color
        ).to.equal('lightgray')
      })
    })

    it('applies the service color', function() {
      expect(coalesceBadge({}, { color: 'red' }, {}).color).to.equal('red')
    })
  })

  describe('Left color', function() {
    it('provides no default label color', function() {
      expect(coalesceBadge({}, {}, {}).labelColor).to.be.undefined
    })

    it('applies the service label color', function() {
      expect(coalesceBadge({}, { labelColor: 'red' }, {}).labelColor).to.equal(
        'red'
      )
    })

    it('overrides the label color', function() {
      expect(
        coalesceBadge({ labelColor: '42f483' }, { color: 'green' }, {})
          .labelColor
      ).to.equal('42f483')
      // also expected for legacy name
      expect(
        coalesceBadge({ colorA: 'B2f483' }, { color: 'green' }, {}).labelColor
      ).to.equal('B2f483')
    })

    it('converts a query-string numeric color to a string', function() {
      expect(
        coalesceBadge(
          // Scoutcamp converts numeric query params to numbers.
          { color: 123 },
          { color: 'green' },
          {}
        ).color
      ).to.equal('123')
      // also expected for legacy name
      expect(
        coalesceBadge(
          // Scoutcamp converts numeric query params to numbers.
          { colorB: 123 },
          { color: 'green' },
          {}
        ).color
      ).to.equal('123')
    })
  })

  describe('Named logos', function() {
    it('when not a social badge, ignores the default named logo', function() {
      expect(coalesceBadge({}, {}, { namedLogo: 'appveyor' }).logo).to.be
        .undefined
    })

    it('when a social badge, uses the default named logo', function() {
      // .not.be.empty for confidence that nothing has changed with `getShieldsIcon()`.
      expect(
        coalesceBadge({ style: 'social' }, {}, { namedLogo: 'appveyor' }).logo
      ).to.equal(getSimpleIcon({ name: 'appveyor' })).and.not.be.empty
    })

    it('applies the named logo', function() {
      expect(coalesceBadge({}, { namedLogo: 'npm' }, {}).namedLogo).to.equal(
        'npm'
      )
      expect(coalesceBadge({}, { namedLogo: 'npm' }, {}).logo).to.equal(
        getShieldsIcon({ name: 'npm' })
      ).and.not.to.be.empty
    })

    it('applies the named logo with color', function() {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoColor: 'blue' }, {}).logo
      ).to.equal(getShieldsIcon({ name: 'npm', color: 'blue' })).and.not.to.be
        .empty
    })

    it('overrides the logo', function() {
      expect(
        coalesceBadge({ logo: 'npm' }, { namedLogo: 'appveyor' }, {}).logo
      ).to.equal(getShieldsIcon({ name: 'npm' })).and.not.be.empty
    })

    it('overrides the logo with a color', function() {
      expect(
        coalesceBadge(
          { logo: 'npm', logoColor: 'blue' },
          { namedLogo: 'appveyor' },
          {}
        ).logo
      ).to.equal(getShieldsIcon({ name: 'npm', color: 'blue' })).and.not.be
        .empty
    })

    it("when the logo is overridden, it ignores the service's logo color, position, and width", function() {
      expect(
        coalesceBadge(
          { logo: 'npm' },
          {
            namedLogo: 'appveyor',
            logoColor: 'red',
            logoPosition: -3,
            logoWidth: 100,
          },
          {}
        ).logo
      ).to.equal(getShieldsIcon({ name: 'npm' })).and.not.be.empty
    })

    it("overrides the service logo's color", function() {
      expect(
        coalesceBadge(
          { logoColor: 'blue' },
          { namedLogo: 'npm', logoColor: 'red' },
          {}
        ).logo
      ).to.equal(getShieldsIcon({ name: 'npm', color: 'blue' })).and.not.be
        .empty
    })

    // https://github.com/badges/shields/issues/2998
    it('overrides logoSvg', function() {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(coalesceBadge({ logo: 'npm' }, { logoSvg }, {}).logo).to.equal(
        getShieldsIcon({ name: 'npm' })
      ).and.not.be.empty
    })
  })

  describe('Custom logos', function() {
    it('overrides the logo with custom svg', function() {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(
        coalesceBadge({ logo: logoSvg }, { namedLogo: 'appveyor' }, {}).logo
      ).to.equal(logoSvg)
    })

    it('ignores the color when custom svg is provided', function() {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(
        coalesceBadge(
          { logo: logoSvg, logoColor: 'brightgreen' },
          { namedLogo: 'appveyor' },
          {}
        ).logo
      ).to.equal(logoSvg)
    })
  })

  describe('Logo width', function() {
    it('overrides the logoWidth', function() {
      expect(coalesceBadge({ logoWidth: 20 }, {}, {}).logoWidth).to.equal(20)
    })

    it('applies the logo width', function() {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoWidth: 275 }, {}).logoWidth
      ).to.equal(275)
    })
  })

  describe('Logo position', function() {
    it('overrides the logoPosition', function() {
      expect(
        coalesceBadge({ logoPosition: -10 }, {}, {}).logoPosition
      ).to.equal(-10)
    })

    it('applies the logo position', function() {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoPosition: -10 }, {})
          .logoPosition
      ).to.equal(-10)
    })
  })

  describe('Links', function() {
    it('overrides the links', function() {
      expect(
        coalesceBadge(
          { link: 'https://circleci.com/gh/badges/daily-tests' },
          {
            link:
              'https://circleci.com/workflow-run/184ef3de-4836-4805-a2e4-0ceba099f92d',
          },
          {}
        ).links
      ).to.deep.equal(['https://circleci.com/gh/badges/daily-tests'])
    })
  })

  describe('Style', function() {
    it('overrides the template', function() {
      expect(coalesceBadge({ style: 'pill' }, {}, {}).template).to.equal('pill')
    })
  })

  describe('Cache length', function() {
    it('overrides the cache length', function() {
      expect(
        coalesceBadge({ style: 'pill' }, { cacheSeconds: 123 }, {})
          .cacheLengthSeconds
      ).to.equal(123)
    })
  })
})
