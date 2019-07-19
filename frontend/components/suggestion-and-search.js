import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import fetchPonyfill from 'fetch-ponyfill'
import debounce from 'lodash.debounce'
import BadgeExamples from './badge-examples'
import { BlockInput } from './common'

export default function SuggestionAndSearch({
  queryChanged,
  onBadgeClick,
  baseUrl,
}) {
  const queryChangedDebounced = useRef(
    debounce(queryChanged, 50, { leading: true })
  )
  const [isUrl, setIsUrl] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [projectUrl, setProjectUrl] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])

  function onQueryChanged(event) {
    const query = event.target.value
    const isUrl = query.startsWith('https://') || query.startsWith('http://')
    setIsUrl(isUrl)
    setProjectUrl(isUrl ? query : undefined)

    queryChangedDebounced.current(query)
  }

  async function getSuggestions() {
    setInProgress(true)

    const fetch = window.fetch || fetchPonyfill
    const res = await fetch(
      `${baseUrl}/$suggest/v1?url=${encodeURIComponent(projectUrl)}`
    )
    let suggestions
    try {
      const json = await res.json()
      // This doesn't validate the response. The default value here prevents
      // a crash if the server returns {"err":"Disallowed"}.
      suggestions = json.suggestions || []
    } catch (e) {
      suggestions = []
    }

    setInProgress(false)
    setSuggestions(suggestions)
  }

  function renderSuggestions() {
    if (suggestions.length === 0) {
      return null
    }

    const transformed = suggestions.map(
      ({ title, link, example, preview, documentation }) => ({
        title,
        link,
        example,
        preview,
        isBadgeSuggestion: true,
        documentation,
      })
    )

    return (
      <BadgeExamples
        baseUrl={baseUrl}
        examples={transformed}
        onClick={onBadgeClick}
      />
    )
  }

  return (
    <section>
      <form action="javascript:void 0" autoComplete="off">
        <BlockInput
          autoFocus
          autofill="off"
          onChange={onQueryChanged}
          placeholder="search / project URL"
        />
        <br />
        <button disabled={inProgress} hidden={!isUrl} onClick={getSuggestions}>
          Suggest badges
        </button>
      </form>
      {renderSuggestions()}
    </section>
  )
}
SuggestionAndSearch.propTypes = {
  queryChanged: PropTypes.func.isRequired,
  onBadgeClick: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
}
