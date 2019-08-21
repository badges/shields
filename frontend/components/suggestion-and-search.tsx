import React, { useRef, useState, ChangeEvent } from 'react'
import fetchPonyfill from 'fetch-ponyfill'
import debounce from 'lodash.debounce'
import { BadgeExamples } from './badge-examples'
import { BlockInput } from './common'

interface SuggestionItem {
  title: string
  link: string
  example: {
    pattern: string
    namedParams: { [k: string]: string }
    queryParams?: { [k: string]: string }
  }
  preview:
    | {
        style?: string
      }
    | undefined
}

interface SuggestionResponse {
  suggestions: SuggestionItem[]
}

export default function SuggestionAndSearch({
  queryChanged,
  onBadgeClick,
  baseUrl,
}: {
  queryChanged: (query: string) => void
  onBadgeClick: () => void
  baseUrl: string
}) {
  const queryChangedDebounced = useRef(
    debounce(queryChanged, 50, { leading: true })
  )
  const [isUrl, setIsUrl] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [projectUrl, setProjectUrl] = useState<string>()
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])

  function onQueryChanged({
    target: { value: query },
  }: ChangeEvent<HTMLInputElement>) {
    const isUrl = query.startsWith('https://') || query.startsWith('http://')
    setIsUrl(isUrl)
    setProjectUrl(isUrl ? query : undefined)

    queryChangedDebounced.current(query)
  }

  async function getSuggestions() {
    if (!projectUrl) {
      setSuggestions([])
      return
    }

    setInProgress(true)

    const fetch = window.fetch || fetchPonyfill
    const res = await fetch(
      `${baseUrl}/$suggest/v1?url=${encodeURIComponent(projectUrl)}`
    )
    let suggestions = [] as SuggestionItem[]
    try {
      const json = (await res.json()) as SuggestionResponse
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
      ({ title, link, example, preview }) => ({
        title,
        link,
        example: {
          ...example,
          queryParams: example.queryParams || {},
        },
        preview: preview || {},
        isBadgeSuggestion: true,
      })
    )

    return (
      <BadgeExamples
        areBadgeSuggestions
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
          autoComplete="off"
          autoFocus
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
