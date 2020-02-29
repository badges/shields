import React from 'react'
import styled from 'styled-components'
import { Link } from 'gatsby'
import { H3 } from './common'

export interface Category {
  id: string
  name: string
}

export function CategoryHeading({
  category: { id, name },
}: {
  category: Category
}): JSX.Element {
  return (
    <Link to={`/category/${id}`}>
      <H3 id={id}>{name}</H3>
    </Link>
  )
}

export function CategoryHeadings({
  categories,
}: {
  categories: Category[]
}): JSX.Element {
  return (
    <div>
      {categories.map(category => (
        <CategoryHeading category={category} key={category.id} />
      ))}
    </div>
  )
}

const StyledNav = styled.nav`
  ul {
    display: flex;

    min-width: 50%;
    max-width: 500px;

    margin: 0 auto 20px;
    padding-inline-start: 0;

    flex-wrap: wrap;
    justify-content: center;

    list-style-type: none;
  }

  @media screen and (max-width: 768px) {
    ul {
      display: none;
    }
  }

  li {
    margin: 4px 10px;
  }

  .active {
    font-weight: 900;
  }
`

export function CategoryNav({
  categories,
}: {
  categories: Category[]
}): JSX.Element {
  return (
    <StyledNav>
      <ul>
        {categories.map(({ id, name }) => (
          <li key={id}>
            <Link to={`/category/${id}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </StyledNav>
  )
}
