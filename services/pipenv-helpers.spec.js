import { expect } from 'chai'
import { getDependencyVersion } from './pipenv-helpers.js'
import { InvalidParameter } from './index.js'

describe('getDependencyVersion', function () {
  // loosely based on https://github.com/pypa/pipfile#pipfilelock
  const packages = {
    chardet: {
      hashes: [
        'sha256:fc323ffcaeaed0e0a02bf4d117757b98aed530d9ed4531e3e15460124c106691',
        'sha256:84ab92ed1c4d4f16916e05906b6b75a6c0fb5db821cc65e70cbd64a3e2a5eaae',
      ],
      version: '==3.0.4',
    },
    django: {
      editable: true,
      git: 'https://github.com/django/django.git',
      ref: '1.11.4001',
    },
    'django-cms': {
      file: 'https://github.com/divio/django-cms/archive/release/3.4.x.zip',
    },
    'discordlists-py': {
      git: 'https://github.com/HexCodeFFF/discordlists.py',
      ref: '2df5a2b62144b49774728efa8267d909a8a9787f',
    },
  }

  it('throws if dependency not found in (in default object with data)', function () {
    expect(() =>
      getDependencyVersion({
        wantedDependency: 'requests',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    )
      .to.throw(InvalidParameter)
      .with.property('prettyMessage', 'default dependency not found')
  })

  it('throws if dependency not found in (in empty dev object)', function () {
    expect(() =>
      getDependencyVersion({
        kind: 'dev',
        wantedDependency: 'requests',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    )
      .to.throw(InvalidParameter)
      .with.property('prettyMessage', 'dev dependency not found')
  })

  it('tolerates missing keys', function () {
    expect(
      getDependencyVersion({
        wantedDependency: 'chardet',
        lockfileData: {
          default: packages,
        },
      })
    ).to.deep.equal({ version: '3.0.4' })
  })

  it('finds package in develop object', function () {
    expect(
      getDependencyVersion({
        kind: 'dev',
        wantedDependency: 'chardet',
        lockfileData: {
          default: {},
          develop: packages,
        },
      })
    ).to.deep.equal({ version: '3.0.4' })
  })

  it('returns version if present', function () {
    expect(
      getDependencyVersion({
        wantedDependency: 'chardet',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    ).to.deep.equal({ version: '3.0.4' })
  })

  it('returns (complete) ref if ref is tag', function () {
    expect(
      getDependencyVersion({
        wantedDependency: 'django',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    ).to.deep.equal({ ref: '1.11.4001' })
  })

  it('returns truncated ref if ref is commit hash', function () {
    expect(
      getDependencyVersion({
        wantedDependency: 'discordlists-py',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    ).to.deep.equal({ ref: '2df5a2b' })
  })

  it('throws if no version or ref', function () {
    expect(() =>
      getDependencyVersion({
        wantedDependency: 'django-cms',
        lockfileData: {
          default: packages,
          develop: {},
        },
      })
    )
      .to.throw(InvalidParameter)
      .with.property('prettyMessage', 'No version or ref for django-cms')
  })
})
