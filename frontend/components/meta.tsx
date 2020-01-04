import React from 'react'
import { Helmet } from 'react-helmet'
// @ts-ignore
import favicon from '../images/favicon.png'

const description = `We serve fast and scalable informational images as badges
for GitHub, Travis CI, Jenkins, WordPress and many more services. Use them to
track the state of your projects, or for promotional purposes.`

export default function Meta(): JSX.Element {
  return (
    <Helmet>
      <title>
        Shields.io: Quality metadata badges for open source projects
      </title>
      <meta charSet="utf-8" />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
      <meta content={description} name="description" />
      <link href={favicon} rel="icon" type="image/png" />
      <link
        href="https://fonts.googleapis.com/css?family=Lato|Lekton"
        rel="stylesheet"
      />
    </Helmet>
  )
}
