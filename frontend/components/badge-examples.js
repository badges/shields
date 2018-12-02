import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import resolveBadgeUrl from '../lib/badge-url'
import { staticBadgeUrl } from '../../lib/make-badge-url'

const nonBreakingSpace = '\u00a0'

export default class BadgeExamples extends React.Component {
  static propTypes = {
    definitions: PropTypes.array.isRequired,
    baseUrl: PropTypes.string,
    longCache: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  buildUrl({ path, pattern, namedParams, queryParams }, { longCache } = {}) {
    const { baseUrl } = this.props

    let outPath
    let outLongCache
    if (pattern === undefined) {
      outPath = path
      outLongCache = longCache
    } else {
      outPath = pattern
      outLongCache = false
    }

    return resolveBadgeUrl(outPath, baseUrl, {
      queryParams,
      longCache: outLongCache,
      format: 'svg',
    })
  }

  renderExample(exampleData) {
    const { baseUrl, longCache, onClick } = this.props
    const { title, example, preview, keywords, documentation } = exampleData

    let previewUrl
    if (preview.label !== undefined) {
      const { label, message, color } = preview
      previewUrl = staticBadgeUrl({ baseUrl, label, message, color })
    } else {
      previewUrl = this.buildUrl(preview, { longCache: true })
    }

    const exampleUrl = this.buildUrl(example)

    const key = `${title} ${previewUrl} ${exampleUrl}`

    const handleClick = () => onClick(exampleData)

    return (
      <tr key={key}>
        <th className="clickable" onClick={handleClick}>
          {title}:
        </th>
        <td>
          <img
            className="badge-img clickable"
            onClick={handleClick}
            src={previewUrl}
            alt=""
          />
        </td>
        <td>
          <code className="clickable" onClick={handleClick}>
            {exampleUrl}
          </code>
        </td>
      </tr>
    )
  }

  render() {
    const { definitions } = this.props

    if (!definitions) {
      return null
    }

    const flattened = definitions.reduce((accum, current) => {
      const { examples } = current
      return accum.concat(examples)
    }, [])

    return (
      <div>
        <table className="badge">
          <tbody>
            {flattened.map(exampleData => this.renderExample(exampleData))}
          </tbody>
        </table>
      </div>
    )
  }
}
