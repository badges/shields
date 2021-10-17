import React, { useRef, useState, ChangeEvent } from 'react'
import fetchPonyfill from 'fetch-ponyfill'
import debounce from 'lodash.debounce'
import { RenderableExample } from '../lib/service-definitions'
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
  onBadgeClick: (example: RenderableExample, isSuggestion: boolean) => void
  baseUrl: string
}): JSX.Element {
  const queryChangedDebounced = useRef(
    debounce(queryChanged, 50, { leading: true })
  )
  const [isUrl, setIsUrl] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [projectUrl, setProjectUrl] = useState<string>()
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])

  const onQueryChanged = React.useCallback(
    function ({
      target: { value: query },
    }: ChangeEvent<HTMLInputElement>): void {
      const isUrl = query.startsWith('https://') || query.startsWith('http://')
      setIsUrl(isUrl)
      setProjectUrl(isUrl ? query : undefined)

      queryChangedDebounced.current(query)
    },
    [setIsUrl, setProjectUrl, queryChangedDebounced]
  )

  const getSuggestions = React.useCallback(
    async function (): Promise<void> {
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
    },
    [setSuggestions, setInProgress, baseUrl, projectUrl]
  )

  function renderSuggestions(): JSX.Element | null {
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

  // TODO: Warning: A future version of React will block javascript: URLs as a security precaution
  // how else to do this?
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
