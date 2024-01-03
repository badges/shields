import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidParameter } from '../index.js'
import GithubDirectoryFileCount from './github-directory-file-count.service.js'

describe('GithubDirectoryFileCount', function () {
  const contents = [
    { extension: '', type: 'tree' },
    { extension: '', type: 'tree' },
    { extension: '.js', type: 'blob' },
    { extension: '.js', type: 'blob' },
    { extension: '.txt', type: 'blob' },
    { extension: '', type: 'commit' },
  ]

  test(GithubDirectoryFileCount.transform, () => {
    given(contents, {
      type: 'dir',
    }).expect({
      count: 2,
    })
    given(contents, {
      type: 'file',
    }).expect({
      count: 3,
    })
    given(contents, {
      type: 'file',
      extension: 'js',
    }).expect({
      count: 2,
    })
  })

  it('throws InvalidParameter on receiving an object as contents instead of an array', function () {
    expect(() => GithubDirectoryFileCount.transform({}, {}))
      .to.throw(InvalidParameter)
      .with.property('prettyMessage', 'not a directory')
  })

  it('throws InvalidParameter on receiving type dir and extension', function () {
    expect(() =>
      GithubDirectoryFileCount.transform(contents, {
        type: 'dir',
        extension: 'js',
      }),
    )
      .to.throw(InvalidParameter)
      .with.property(
        'prettyMessage',
        'extension is applicable for type file only',
      )
  })

  it('throws InvalidParameter on receiving no type and extension', function () {
    expect(() =>
      GithubDirectoryFileCount.transform(contents, { extension: 'js' }),
    )
      .to.throw(InvalidParameter)
      .with.property(
        'prettyMessage',
        'extension is applicable for type file only',
      )
  })
})
