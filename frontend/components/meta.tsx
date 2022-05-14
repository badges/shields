import React from 'react'
import { Helmet } from 'react-helmet'
// eslint-disable-next-line
// @ts-ignore
import appletouchicon from '../images/apple-touch-icon.png'
import manifest from '../images/site.webmanifest'
import icon32x32 from '../images/favicon-32x32.png'
import icon16x16 from '../images/favicon-16x16.png'
import maskicon from '../images/safari-pinned-tab.svg'
import shortcuticon from '../images/favicon.ico'
import msapplicationconfig from '../images/browserconfig.xml'
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
      <meta charSet="utf-8" />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
      <meta content={description} name="description" />
      <link rel="icon" type="image/png" sizes="32x32" href={icon32x32} />
      <link rel="icon" type="image/png" sizes="16x16" href={icon16x16} />
      <link rel="apple-touch-icon" sizes="180x180" href={appletouchicon} />
      <link rel="manifest" href={manifest} />
      <link rel="mask-icon" href={maskicon} color="#5bbad5" />
      <link rel="shortcut icon" href={shortcuticon} />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="msapplication-config" content={msapplicationconfig} />
      <meta name="apple-mobile-web-app-title" content="Shields.io" />
      <meta name="application-name" content="Shields.io" />
      <meta name="theme-color" content="#ffffff" />
    </Helmet>
  )
}
