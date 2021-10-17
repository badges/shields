import React, { useRef } from 'react'
import styled from 'styled-components'
import Select, { components } from 'react-select'
import { MarkupFormat } from '../../lib/generate-image-markup'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ClickableControl(props: any): JSX.Element {
  return (
    <components.Control
      {...props}
      innerProps={{
        onMouseDown: props.selectProps.onControlMouseDown,
      }}
    />
  )
}

interface Option {
  value: MarkupFormat
  label: string
}

const MarkupFormatSelect = styled(Select)`
  width: 200px;

  margin-left: auto;
  margin-right: auto;

  font-family: 'Lato', sans-serif;
  font-size: 12px;

  .markup-format__control {
    background-image: linear-gradient(-180deg, #00aeff 0%, #0076ff 100%);
    border: 1px solid rgba(238, 239, 241, 0.8);
    border-width: 0;
    box-shadow: unset;
    cursor: copy;
  }

  .markup-format__control--is-disabled {
    background: rgba(0, 118, 255, 0.3);
    cursor: none;
  }

  .markup-format__placeholder {
    color: #eeeff1;
  }

  .markup-format__indicator {
    color: rgba(238, 239, 241, 0.81);
    cursor: pointer;
  }

  .markup-format__indicator:hover {
    color: #eeeff1;
  }

  .markup-format__control--is-focused .markup-format__indicator,
  .markup-format__control--is-focused .markup-format__indicator:hover {
    color: #ffffff;
  }

  .markup-format__option {
    text-align: left;
    cursor: copy;
  }
`

const markupOptions: Option[] = [
  { value: 'markdown', label: 'Copy Markdown' },
  { value: 'rst', label: 'Copy reStructuredText' },
  { value: 'asciidoc', label: 'Copy AsciiDoc' },
  { value: 'html', label: 'Copy HTML' },
]

export default function GetMarkupButton({
  onMarkupRequested,
  isDisabled,
}: {
  onMarkupRequested: (markupFormat: MarkupFormat) => Promise<void>
  isDisabled: boolean
}): JSX.Element {
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35572
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/28884#issuecomment-471341041
  const selectRef = useRef<Select<Option>>() as React.MutableRefObject<
    Select<Option>
  >

  const onControlMouseDown = React.useCallback(
    async function (event: MouseEvent): Promise<void> {
      if (onMarkupRequested) {
        await onMarkupRequested('link')
      }
      if (selectRef.current) {
        selectRef.current.blur()
      }
    },
    [onMarkupRequested, selectRef]
  )

  const onOptionClick = React.useCallback(
    async function onOptionClick(
      // Eeesh.
      value: Option | readonly Option[] | null | undefined
    ): Promise<void> {
      const { value: markupFormat } = value as Option
      if (onMarkupRequested) {
        await onMarkupRequested(markupFormat)
      }
    },
    [onMarkupRequested]
  )

  return (
    // TODO It doesn't seem to be possible to check the types and wrap with
    // styled-components at the same time. To check the types, replace
    // `MarkupFormatSelect` with `Select<Option>`.
    <MarkupFormatSelect
      blurInputOnSelect
      classNamePrefix="markup-format"
      closeMenuOnScroll
      components={{ Control: ClickableControl }}
      isDisabled={isDisabled}
      isSearchable={false}
      menuPlacement="auto"
      onChange={onOptionClick}
      onControlMouseDown={onControlMouseDown}
      options={markupOptions}
      placeholder="Copy Badge URL"
      ref={selectRef}
      value={null}
    />
  )
}
