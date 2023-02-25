import React, { useRef, ChangeEvent } from 'react'
import debounce from 'lodash.debounce'
import { BlockInput } from './common'

export default function Search({
  queryChanged,
}: {
  queryChanged: (query: string) => void
}): JSX.Element {
  const queryChangedDebounced = useRef(
    debounce(queryChanged, 50, { leading: true })
  )

  const onQueryChanged = React.useCallback(
    function ({
      target: { value: query },
    }: ChangeEvent<HTMLInputElement>): void {
      queryChangedDebounced.current(query)
    },
    [queryChangedDebounced]
  )

  // TODO: Warning: A future version of React will block javascript: URLs as a security precaution
  // how else to do this?
  return (
    <section>
      <form action="javascript:void 0" autoComplete="off">
        <BlockInput
          autoComplete="off"
          onChange={onQueryChanged}
          placeholder="search"
        />
      </form>
    </section>
  )
}
