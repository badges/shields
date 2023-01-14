import React from 'react'
import styled from 'styled-components'
import { Example, RenderableExample } from '../../lib/service-definitions'
import { H3 } from '../common'
import Customizer from '../customizer/customizer'

const Documentation = styled.div`
  max-width: 800px;
  margin: 35px auto 20px;
  text-align: left;
`

export function MarkupModalContent({
  example,
  baseUrl,
}: {
  example: RenderableExample
  baseUrl: string
}): JSX.Element {
  const { documentation } = example as Example

  const {
    title,
    example: { pattern, namedParams, queryParams },
    preview: { style: initialStyle },
  } = example

  return (
    <>
      <H3>{title}</H3>
      {documentation ? (
        <Documentation dangerouslySetInnerHTML={documentation} />
      ) : null}
      <Customizer
        baseUrl={baseUrl}
        exampleNamedParams={namedParams}
        exampleQueryParams={queryParams}
        initialStyle={initialStyle}
        pattern={pattern}
        title={title}
      />
    </>
  )
}
