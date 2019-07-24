import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clipboardCopy from 'clipboard-copy'
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { generateMarkup } from '../../lib/generate-image-markup'
import { objectOfKeyValuesPropType } from '../../lib/service-definitions/service-definition-prop-types'
import { Badge } from '../common'
import PathBuilder from './path-builder'
import QueryStringBuilder from './query-string-builder'
import RequestMarkupButtom from './request-markup-button'
import CopiedContentIndicator from './copied-content-indicator'

function getBaseUrlFromWindowLocation() {
  // Default to the current hostname for when there is no `BASE_URL` set
  // at build time (as in most PaaS deploys).
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}`
}

export default function Customizer({
  baseUrl,
  title,
  pattern,
  exampleNamedParams,
  exampleQueryParams,
  initialStyle,
  isPrefilled,
  link = '',
}) {
  const indicatorRef = useRef()
  const [path, setPath] = useState('')
  const [queryString, setQueryString] = useState()
  const [pathIsComplete, setPathIsComplete] = useState()
  const [markup, setMarkup] = useState()
  const [message, setMessage] = useState()

  function generateBuiltBadgeUrl() {
    const suffix = queryString ? `?${queryString}` : ''
    return `${baseUrl || getBaseUrlFromWindowLocation()}${path}${suffix}`
  }

  function renderLivePreview() {
    // There are some usability issues here. It would be better if the message
    // changed from a validation error to a loading message once the
    // parameters were filled in, and also switched back to loading when the
    // parameters changed.
    let src
    if (pathIsComplete) {
      src = generateBuiltBadgeUrl()
    } else {
      src = staticBadgeUrl({
        baseUrl,
        label: 'preview',
        message: 'some parameters missing',
      })
    }
    return (
      <p>
        <Badge display="block" src={src} />
      </p>
    )
  }

  async function copyMarkup(markupFormat) {
    const builtBadgeUrl = generateBuiltBadgeUrl()
    const markup = generateMarkup({
      badgeUrl: builtBadgeUrl,
      link,
      title,
      markupFormat,
    })

    try {
      await clipboardCopy(markup)
    } catch (e) {
      setMessage('Copy failed')
      setMarkup(markup)
      return
    }

    setMarkup(markup)
    indicatorRef.current.trigger()
  }

  function renderMarkupAndLivePreview() {
    return (
      <div>
        {renderLivePreview()}
        <CopiedContentIndicator copiedContent="Copied" ref={indicatorRef}>
          <RequestMarkupButtom
            isDisabled={!pathIsComplete}
            onMarkupRequested={copyMarkup}
          />
        </CopiedContentIndicator>
        {message && (
          <div>
            <p>{message}</p>
            <p>Markup: {markup}</p>
          </div>
        )}
      </div>
    )
  }

  function handlePathChange({ path, isComplete }) {
    setPath(path)
    setPathIsComplete(isComplete)
  }

  function handleQueryStringChange({ queryString, isComplete }) {
    setQueryString(queryString)
  }

  return (
    <form action="">
      <PathBuilder
        exampleParams={exampleNamedParams}
        isPrefilled={isPrefilled}
        onChange={handlePathChange}
        pattern={pattern}
      />
      <QueryStringBuilder
        exampleParams={exampleQueryParams}
        initialStyle={initialStyle}
        onChange={handleQueryStringChange}
      />
      <div>{renderMarkupAndLivePreview()}</div>
    </form>
  )
}
Customizer.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  exampleNamedParams: objectOfKeyValuesPropType,
  exampleQueryParams: objectOfKeyValuesPropType,
  initialStyle: PropTypes.string,
  isPrefilled: PropTypes.bool,
  link: PropTypes.string,
}
