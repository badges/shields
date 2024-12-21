import React, { useRef, useState, useEffect } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import clsx from 'clsx'
import codegen from 'postman-code-generators'
import { Highlight } from 'prism-react-renderer'
import { useTypedSelector } from '@theme/ApiDemoPanel/hooks'
import buildPostmanRequest from '@theme/ApiDemoPanel/buildPostmanRequest'
import FloatingButton from '@theme/ApiDemoPanel/FloatingButton'
import styles from 'docusaurus-theme-openapi/lib/theme/ApiDemoPanel/Curl/styles.module.css'

const languageSet = [
  {
    tabName: 'cURL',
    highlight: 'bash',
    language: 'curl',
    variant: 'curl',
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: 'Node',
    highlight: 'javascript',
    language: 'nodejs',
    variant: 'axios',
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: 'Go',
    highlight: 'go',
    language: 'go',
    variant: 'native',
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: 'Python',
    highlight: 'python',
    language: 'python',
    variant: 'requests',
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
]
const languageTheme = {
  plain: {
    color: 'var(--ifm-code-color)',
  },
  styles: [
    {
      types: ['inserted', 'attr-name'],
      style: {
        color: 'var(--openapi-code-green)',
      },
    },
    {
      types: ['string', 'url'],
      style: {
        color: 'var(--openapi-code-green)',
      },
    },
    {
      types: ['builtin', 'char', 'constant', 'function'],
      style: {
        color: 'var(--openapi-code-blue)',
      },
    },
    {
      types: ['punctuation', 'operator'],
      style: {
        color: 'var(--openapi-code-dim)',
      },
    },
    {
      types: ['class-name'],
      style: {
        color: 'var(--openapi-code-orange)',
      },
    },
    {
      types: ['tag', 'arrow', 'keyword'],
      style: {
        color: 'var(--openapi-code-purple)',
      },
    },
    {
      types: ['boolean'],
      style: {
        color: 'var(--openapi-code-red)',
      },
    },
  ],
}

function getBaseUrl() {
  /*
  This is a special case for production.

  We want to be able to build the front end with no value set for
  `BASE_URL` so that staging, prod and self hosting users
  can all use the same docker image.

  When deployed to staging, we want the frontend on
  https://staging.shields.io/ to generate badges with the base
  https://staging.shields.io/
  (and we want similar behaviour for users hosting their own instance)

  When we promote to production we want https://shields.io/ and
  https://www.shields.io/ to both generate badges with the base
  https://img.shields.io/

  For local dev, we can deal with setting the api and front-end
  being on different ports using the BASE_URL env var
  */
  const { protocol, hostname, port } = window.location
  if (['shields.io', 'www.shields.io'].includes(hostname)) {
    return 'https://img.shields.io'
  }
  if (!port) {
    return `${protocol}//${hostname}`
  }
  return `${protocol}//${hostname}:${port}`
}

function getServer() {
  return {
    url: getBaseUrl(),
    variables: {},
  }
}

function Curl({ postman, codeSamples }) {
  // TODO: match theme for vscode.
  const { siteConfig } = useDocusaurusContext()
  const [copyText, setCopyText] = useState('Copy')
  const contentType = useTypedSelector(state => state.contentType.value)
  const accept = useTypedSelector(state => state.accept.value)
  const server = useTypedSelector(state => state.server.value) || getServer()
  const body = useTypedSelector(state => state.body)
  const pathParams = useTypedSelector(state => state.params.path)
  const queryParams = useTypedSelector(state => state.params.query)
  const cookieParams = useTypedSelector(state => state.params.cookie)
  const headerParams = useTypedSelector(state => state.params.header)
  const auth = useTypedSelector(state => state.auth)

  const langs = [
    ...(siteConfig?.themeConfig?.languageTabs ?? languageSet),
    ...codeSamples,
  ]
  const [language, setLanguage] = useState(langs[0])
  const [codeText, setCodeText] = useState('')
  useEffect(() => {
    const postmanRequest = buildPostmanRequest(postman, {
      queryParams,
      pathParams,
      cookieParams,
      contentType,
      accept,
      headerParams,
      body,
      server,
      auth,
    })
    if (language && !!language.options) {
      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error, snippet) => {
          if (error) {
            return
          }

          setCodeText(snippet)
        },
      )
    } else if (language && !!language.source) {
      setCodeText(
        language.source.replace('$url', postmanRequest.url.toString()),
      )
    } else {
      setCodeText('')
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    server,
    auth,
  ])
  const ref = useRef(null)

  const handleCurlCopy = () => {
    setCopyText('Copied')
    setTimeout(() => {
      setCopyText('Copy')
    }, 2000)

    if (ref.current?.innerText) {
      navigator.clipboard.writeText(ref.current.innerText)
    }
  }

  if (language === undefined) {
    return null
  }

  return (
    <>
      <div className={clsx(styles.buttonGroup, 'api-code-tab-group')}>
        {langs.map(lang => (
          <button
            className={clsx(
              language === lang ? styles.selected : undefined,
              language === lang ? 'api-code-tab--active' : undefined,
              'api-code-tab',
            )}
            key={lang.tabName || lang.label}
            onClick={() => setLanguage(lang)}
            type="button"
          >
            {lang.tabName || lang.label}
          </button>
        ))}
      </div>

      <Highlight
        code={codeText}
        language={language.highlight || language.lang}
        theme={languageTheme}
      >
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <FloatingButton label={copyText} onClick={handleCurlCopy}>
            <pre
              className={className}
              style={{
                background: 'var(--openapi-card-background-color)',
                paddingRight: '60px',
                borderRadius:
                  '2px 2px var(--openapi-card-border-radius) var(--openapi-card-border-radius)',
              }}
            >
              <code ref={ref}>
                {tokens.map((line, i) => (
                  // this <span> does have a key but eslint fails
                  // to detect it because it is an arg to getLineProps()
                  <span
                    {...getLineProps({
                      line,
                      key: i,
                    })}
                  >
                    {line.map((token, key) => {
                      if (token.types.includes('arrow')) {
                        token.types = ['arrow']
                      }

                      return (
                        // this <span> does have a key but eslint fails
                        // to detect it because it is an arg to getLineProps()
                        <span
                          {...getTokenProps({
                            token,
                            key,
                          })}
                        />
                      )
                    })}
                    {'\n'}
                  </span>
                ))}
              </code>
            </pre>
          </FloatingButton>
        )}
      </Highlight>
    </>
  )
}

export default Curl
