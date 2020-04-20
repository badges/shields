import React from 'react'
import styled from 'styled-components'

const BuilderOuterContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`

// The inner container is inline-block so that its width matches its columns.
const BuilderInnerContainer = styled.div`
  display: inline-block;

  padding: 1px 14px 10px;

  border-radius: 4px;
  background: #eef;
`

export function BuilderContainer({
  children,
}: {
  children: JSX.Element[] | JSX.Element
}): JSX.Element {
  return (
    <BuilderOuterContainer>
      <BuilderInnerContainer>{children}</BuilderInnerContainer>
    </BuilderOuterContainer>
  )
}

const labelFont = `
  font-family: system-ui;
  font-size: 11px;
`

export const BuilderLabel = styled.label`
  ${labelFont}

  text-transform: lowercase;
`

export const BuilderCaption = styled.span`
  ${labelFont}

  color: #999;
`
