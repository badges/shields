import React, { useRef } from 'react'
import styled from 'styled-components'
import Select, { components } from 'react-select'
import { MarkupFormat } from '../../lib/generate-image-markup'

const ClickableControl = (props: any) => (
  <components.Control
    {...props}
    innerProps={{
      onMouseDown: props.selectProps.onControlMouseDown,
    }}
  />
)

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

// TODO Have the type checker validate that all the `value` options are valid
// for MarkupFormat.
const markupOptions = [
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
}) {
  const selectRef = useRef<HTMLSelectElement>()

  async function onControlMouseDown(event: MouseEvent) {
    if (onMarkupRequested) {
      await onMarkupRequested('link')
    }
    if (selectRef.current) {
      selectRef.current.blur()
    }
  }

  async function onOptionClick({ value: markupFormat }: { value?: string }) {
    if (onMarkupRequested) {
      await onMarkupRequested(markupFormat as MarkupFormat)
    }
  }

  return (
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
      value=""
    />
  )
}
