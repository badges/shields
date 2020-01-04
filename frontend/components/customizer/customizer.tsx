import React, { useRef, useState } from 'react'
import clipboardCopy from 'clipboard-copy'
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { generateMarkup, MarkupFormat } from '../../lib/generate-image-markup'
import { Badge } from '../common'
import PathBuilder from './path-builder'
import QueryStringBuilder from './query-string-builder'
import RequestMarkupButtom from './request-markup-button'
import {
  CopiedContentIndicator,
  CopiedContentIndicatorHandle,
} from './copied-content-indicator'

function getBaseUrlFromWindowLocation(): string {
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
}: {
  baseUrl: string
  title: string
  pattern: string
  exampleNamedParams: { [k: string]: string }
  exampleQueryParams: { [k: string]: string }
  initialStyle?: string
  isPrefilled: boolean
  link?: string
}): JSX.Element {
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35572
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/28884#issuecomment-471341041
  const indicatorRef = useRef<
    CopiedContentIndicatorHandle
  >() as React.MutableRefObject<CopiedContentIndicatorHandle>
  const [path, setPath] = useState('')
  const [queryString, setQueryString] = useState()
  const [pathIsComplete, setPathIsComplete] = useState()
  const [markup, setMarkup] = useState()
  const [message, setMessage] = useState()

  function generateBuiltBadgeUrl(): string {
    const suffix = queryString ? `?${queryString}` : ''
    return `${baseUrl || getBaseUrlFromWindowLocation()}${path}${suffix}`
  }

  function renderLivePreview(): JSX.Element {
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
        <Badge alt="preview badge" display="block" src={src} />
      </p>
    )
  }

  async function copyMarkup(markupFormat: MarkupFormat): Promise<void> {
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
    if (indicatorRef.current) {
      indicatorRef.current.trigger()
    }
  }

  function renderMarkupAndLivePreview(): JSX.Element {
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

  function handlePathChange({
    path,
    isComplete,
  }: {
    path: string
    isComplete: boolean
  }): void {
    setPath(path)
    setPathIsComplete(isComplete)
  }

  function handleQueryStringChange({
    queryString,
    isComplete,
  }: {
    queryString: string
    isComplete: boolean
  }): void {
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
