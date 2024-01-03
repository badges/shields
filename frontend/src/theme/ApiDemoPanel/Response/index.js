import React from 'react'
import { useTypedDispatch, useTypedSelector } from '@theme/ApiDemoPanel/hooks'
import FloatingButton from '@theme/ApiDemoPanel/FloatingButton'
import { clearResponse } from 'docusaurus-theme-openapi/lib/theme/ApiDemoPanel/Response/slice'

function formatXml(xml) {
  const tab = '  '
  let formatted = ''
  let indent = ''
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      // decrease indent by one 'tab'
      indent = indent.substring(tab.length)
    }

    formatted += `${indent}<${node}>\r\n`

    if (node.match(/^<?\w[^>]*[^/]$/)) {
      // increase indent
      indent += tab
    }
  })
  return formatted.substring(1, formatted.length - 3)
}

function Response() {
  const response = useTypedSelector(state => state.response.value)
  const dispatch = useTypedDispatch()

  if (response === undefined) {
    return null
  }

  let prettyResponse = response

  try {
    prettyResponse = JSON.stringify(JSON.parse(response), null, 2)
  } catch {
    if (response.startsWith('<?xml ')) {
      prettyResponse = formatXml(response)
    }
  }

  return (
    <FloatingButton label="Clear" onClick={() => dispatch(clearResponse())}>
      {(response.startsWith('<svg ') && (
        <img
          id="badge-preview"
          src={`data:image/svg+xml;utf8,${encodeURIComponent(response)}`}
        />
      )) || (
        <pre
          style={{
            background: 'var(--openapi-card-background-color)',
            borderRadius: 'var(--openapi-card-border-radius)',
            paddingRight: '60px',
          }}
        >
          <code>{prettyResponse || 'No Response'}</code>
        </pre>
      )}
    </FloatingButton>
  )
}

export default Response
