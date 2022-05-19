import React from 'react'
import { Helmet } from 'react-helmet'
// eslint-disable-next-line
// @ts-ignore
import appletouch from '../images/apple-touch-icon.png'
import android192x192 from '../images/android-chrome-192x192.png'
import android512x512 from '../images/android-chrome-512x512.png'
import favicon16x16 from '../images/favicon-16x16.png'
import favicon32x32 from '../images/favicon-32x32.png'
import faviconico from '../images/favicon.ico'
import mstile150x150 from '../images/mstile-150x150.png'
import '@fontsource/lato'
import '@fontsource/lekton'

const description = `We serve fast and scalable informational images as badges
for GitHub, Travis CI, Jenkins, WordPress and many more services. Use them to
track the state of your projects, or for promotional purposes.`

export default function Meta(): JSX.Element {
  return (
    <Helmet>
      <title>
        Shields.io: Quality metadata badges for open source projects
      </title>
      <link href={appletouch} rel="apple-touch-icon" sizes="180x180" />
      <link href={android192x192} rel="icon" sizes="192x192" type="image/png" />
      <link href={android512x512} rel="icon" sizes="512x512" type="image/png" />
      <link href={favicon32x32} rel="icon" sizes="32x32" type="image/png" />
      <link href={favicon16x16} rel="icon" sizes="16x16" type="image/png" />
      <link href={faviconico} rel="shortcut icon" />
      <meta charSet="utf-8" />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
      <meta content={description} name="description" />
      <meta content="Shields.io" name="apple-mobile-web-app-title" />
      <meta content="Shields.io" name="application-name" />
      <meta content="#ffffff" name="theme-color" />
      <meta content={mstile150x150} name="msapplication-TileImage" />
    </Helmet>
  )
}
