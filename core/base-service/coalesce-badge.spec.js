import { expect } from 'chai'
import { getShieldsIcon, getSimpleIcon } from '../../lib/logos.js'
import coalesceBadge from './coalesce-badge.js'

describe('coalesceBadge', function () {
  describe('Label', function () {
    it('uses the default label', function () {
      expect(coalesceBadge({}, {}, { label: 'heyo' })).to.include({
        label: 'heyo',
      })
    })

    // This behavior isn't great and we might want to remove it.
    it('uses the category as a default label', function () {
      expect(coalesceBadge({}, {}, {}, { category: 'cat' })).to.include({
        label: 'cat',
      })
    })

    it('preserves an empty label', function () {
      expect(coalesceBadge({}, { label: '', message: '10k' }, {})).to.include({
        label: '',
      })
    })

    it('overrides the label', function () {
      expect(
        coalesceBadge({ label: 'purr count' }, { label: 'purrs' }, {})
      ).to.include({ label: 'purr count' })
    })
  })

  describe('Message', function () {
    it('applies the service message', function () {
      expect(coalesceBadge({}, { message: '10k' }, {})).to.include({
        message: '10k',
      })
    })

    // https://github.com/badges/shields/issues/1280
    it('converts a number to a string', function () {
      // While a number of badges use this, in the long run we may want
      // `render()` to always return a string.
      expect(coalesceBadge({}, { message: 10 }, {})).to.include({
        message: 10,
      })
    })
  })

  describe('Right color', function () {
    it('uses the default color', function () {
      expect(coalesceBadge({}, {}, {})).to.include({ color: 'lightgrey' })
    })

    it('overrides the color', function () {
      expect(
        coalesceBadge({ color: '10ADED' }, { color: 'red' }, {})
      ).to.include({ color: '10ADED' })
      // also expected for legacy name
      expect(
        coalesceBadge({ colorB: 'B0ADED' }, { color: 'red' }, {})
      ).to.include({ color: 'B0ADED' })
    })

    context('In case of an error', function () {
      it('does not override the color', function () {
        expect(
          coalesceBadge(
            { color: '10ADED' },
            { isError: true, color: 'lightgray' },
            {}
          )
        ).to.include({ color: 'lightgray' })
        // also expected for legacy name
        expect(
          coalesceBadge(
            { colorB: 'B0ADED' },
            { isError: true, color: 'lightgray' },
            {}
          )
        ).to.include({ color: 'lightgray' })
      })
    })

    it('applies the service color', function () {
      expect(coalesceBadge({}, { color: 'red' }, {})).to.include({
        color: 'red',
      })
    })
  })

  describe('Left color', function () {
    it('provides no default label color', function () {
      expect(coalesceBadge({}, {}, {}).labelColor).to.be.undefined
    })

    it('applies the service label color', function () {
      expect(coalesceBadge({}, { labelColor: 'red' }, {})).to.include({
        labelColor: 'red',
      })
    })

    it('overrides the label color', function () {
      expect(
        coalesceBadge({ labelColor: '42f483' }, { color: 'green' }, {})
      ).to.include({ labelColor: '42f483' })
      // also expected for legacy name
      expect(
        coalesceBadge({ colorA: 'B2f483' }, { color: 'green' }, {})
      ).to.include({ labelColor: 'B2f483' })
    })

    it('converts a query-string numeric color to a string', function () {
      expect(
        coalesceBadge(
          // Scoutcamp converts numeric query params to numbers.
          { color: 123 },
          { color: 'green' },
          {}
        )
      ).to.include({ color: '123' })
      // also expected for legacy name
      expect(
        coalesceBadge(
          // Scoutcamp converts numeric query params to numbers.
          { colorB: 123 },
          { color: 'green' },
          {}
        )
      ).to.include({ color: '123' })
    })
  })

  describe('Named logos', function () {
    it('when not a social badge, ignores the default named logo', function () {
      expect(coalesceBadge({}, {}, { namedLogo: 'appveyor' }).logo).to.be
        .undefined
    })

    it('when a social badge, uses the default named logo', function () {
      // .not.be.empty for confidence that nothing has changed with `getShieldsIcon()`.
      expect(
        coalesceBadge({ style: 'social' }, {}, { namedLogo: 'appveyor' }).logo
      ).to.equal(getSimpleIcon({ name: 'appveyor' })).and.not.be.empty
    })

    it('applies the named logo', function () {
      expect(coalesceBadge({}, { namedLogo: 'npm' }, {})).to.include({
        namedLogo: 'npm',
      })
      expect(coalesceBadge({}, { namedLogo: 'npm' }, {}).logo).to.equal(
        getShieldsIcon({ name: 'npm' })
      ).and.not.to.be.empty
    })

    it('applies the named logo with color', function () {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoColor: 'blue' }, {}).logo
      ).to.equal(getShieldsIcon({ name: 'npm', color: 'blue' })).and.not.to.be
        .empty
    })

    it('overrides the logo', function () {
      expect(
        coalesceBadge({ logo: 'npm' }, { namedLogo: 'appveyor' }, {}).logo
      ).to.equal(getShieldsIcon({ name: 'npm' })).and.not.be.empty
    })

    it('overrides the logo with a color', function () {
      expect(
        coalesceBadge(
          { logo: 'npm', logoColor: 'blue' },
          { namedLogo: 'appveyor' },
          {}
        ).logo
      ).to.equal(getShieldsIcon({ name: 'npm', color: 'blue' })).and.not.be
        .empty
    })

    it("when the logo is overridden, it ignores the service's logo color, position, and width", function () {
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

    it("overrides the service logo's color", function () {
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
    it('overrides logoSvg', function () {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(coalesceBadge({ logo: 'npm' }, { logoSvg }, {}).logo).to.equal(
        getShieldsIcon({ name: 'npm' })
      ).and.not.be.empty
    })
  })

  describe('Custom logos', function () {
    it('overrides the logo with custom svg', function () {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(
        coalesceBadge({ logo: logoSvg }, { namedLogo: 'appveyor' }, {})
      ).to.include({ logo: logoSvg })
    })

    it('ignores the color when custom svg is provided', function () {
      const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
      expect(
        coalesceBadge(
          { logo: logoSvg, logoColor: 'brightgreen' },
          { namedLogo: 'appveyor' },
          {}
        )
      ).to.include({ logo: logoSvg })
    })
  })

  describe('Logo width', function () {
    it('overrides the logoWidth', function () {
      expect(coalesceBadge({ logoWidth: 20 }, {}, {})).to.include({
        logoWidth: 20,
      })
    })

    it('applies the logo width', function () {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoWidth: 275 }, {})
      ).to.include({ logoWidth: 275 })
    })
  })

  describe('Logo position', function () {
    it('overrides the logoPosition', function () {
      expect(coalesceBadge({ logoPosition: -10 }, {}, {})).to.include({
        logoPosition: -10,
      })
    })

    it('applies the logo position', function () {
      expect(
        coalesceBadge({}, { namedLogo: 'npm', logoPosition: -10 }, {})
      ).to.include({ logoPosition: -10 })
    })
  })

  describe('Links', function () {
    it('overrides the links', function () {
      expect(
        coalesceBadge(
          { link: 'https://circleci.com/gh/badges/daily-tests' },
          {
            link: 'https://circleci.com/workflow-run/184ef3de-4836-4805-a2e4-0ceba099f92d',
          },
          {}
        ).links
      ).to.deep.equal(['https://circleci.com/gh/badges/daily-tests'])
    })
  })

  describe('Style', function () {
    it('falls back to flat with invalid style', function () {
      expect(coalesceBadge({ style: 'pill' }, {}, {})).to.include({
        style: 'flat',
      })
      expect(coalesceBadge({ style: 7 }, {}, {})).to.include({
        style: 'flat',
      })
      expect(coalesceBadge({ style: undefined }, {}, {})).to.include({
        style: 'flat',
      })
    })

    it('replaces legacy popout styles', function () {
      expect(coalesceBadge({ style: 'popout' }, {}, {})).to.include({
        style: 'flat',
      })
      expect(coalesceBadge({ style: 'popout-square' }, {}, {})).to.include({
        style: 'flat-square',
      })
    })
  })

  describe('Cache length', function () {
    it('overrides the cache length', function () {
      expect(
        coalesceBadge({ style: 'pill' }, { cacheSeconds: 123 }, {})
      ).to.include({ cacheLengthSeconds: 123 })
    })
  })
})
