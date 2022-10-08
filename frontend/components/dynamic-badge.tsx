import React, {
  useState,
  ChangeEvent,
  useCallback,
  SetStateAction,
  Dispatch,
} from 'react'
import { dynamicBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { InlineInput } from './common'
import { StyledCode } from './snippet'

type StateKey = 'label' | 'dataUrl' | 'query' | 'color' | 'prefix' | 'suffix'
type State = Record<StateKey, string>

interface InputDef {
  name: StateKey
  placeholder?: string
}

const inputs = [
  { name: 'label' },
  { name: 'dataUrl', placeholder: 'data url' },
  { name: 'query' },
  { name: 'color' },
  { name: 'prefix' },
  { name: 'suffix' },
] as InputDef[]

function DynamicBadgeMaker({
  baseUrl = document.location.href,
  datatype,
  setDatatype,
}: {
  baseUrl: string
  datatype: string
  setDatatype: Dispatch<SetStateAction<string>>
}): JSX.Element {
  const [values, setValues] = useState<State>({
    label: '',
    dataUrl: '',
    query: '',
    color: '',
    prefix: '',
    suffix: '',
  })

  const isValid = datatype && values.label && values.dataUrl && values.query

  const onChange = React.useCallback(
    function ({
      target: { name, value },
    }: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
      setValues({
        ...values,
        [name]: value,
      })
    },
    [values]
  )

  const onSubmit = React.useCallback(
    function onSubmit(e: React.FormEvent): void {
      e.preventDefault()

      const { label, dataUrl, query, color, prefix, suffix } = values
      window.open(
        dynamicBadgeUrl({
          baseUrl,
          datatype,
          label,
          dataUrl,
          query,
          color,
          prefix,
          suffix,
        }),
        '_blank'
      )
    },
    [baseUrl, values, datatype]
  )

  const dataTypeChanged = useCallback(
    function ({
      target: { value },
    }: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
      setDatatype(value)
    },
    [setDatatype]
  )

  return (
    <form onSubmit={onSubmit}>
      <select name="datatype" onChange={dataTypeChanged} value={datatype}>
        <option disabled value="">
          data type
        </option>
        <option value="json">json</option>
        <option value="xml">xml</option>
        <option value="yaml">yaml</option>
      </select>{' '}
      {inputs.map(({ name, placeholder = name }) => (
        <InlineInput
          key={name}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          value={values[name]}
        />
      ))}
      <button disabled={!isValid}>Make Badge</button>
    </form>
  )
}

function DynamicBadgeFormat({
  datatype,
  baseUrl,
}: {
  datatype: string
  baseUrl: string
}): JSX.Element {
  if (datatype === 'json') {
    return (
      <>
        {baseUrl}
        /badge/dynamic/json?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
        <a
          href="https://jsonpath.com"
          rel="noopener noreferrer"
          target="_blank"
          title="JSONPath syntax"
        >
          $.DATA.SUBDATA
        </a>
        &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
      </>
    )
  } else if (datatype === 'xml') {
    return (
      <>
        {baseUrl}
        /badge/dynamic/xml?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
        <a
          href="http://xpather.com"
          rel="noopener noreferrer"
          target="_blank"
          title="XPath syntax"
        >
          &#x2F;&#x2F;data/subdata
        </a>
        &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
      </>
    )
  } else if (datatype === 'yaml') {
    return (
      <>
        {baseUrl}
        /badge/dynamic/yaml?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
        <a
          href="https://jsonpath.com"
          rel="noopener noreferrer"
          target="_blank"
          title="YAML (JSONPath) syntax"
        >
          $.DATA.SUBDATA
        </a>
        &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
      </>
    )
  } else {
    return (
      <>
        {baseUrl}
        /badge/dynamic/&lt;DATA_TYPE&gt;?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
        QUERY&gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
      </>
    )
  }
}

export default function DynamicBadgeDisplay({
  baseUrl,
}: {
  baseUrl: string
}): JSX.Element {
  const [datatype, setDatatype] = useState<string>('')

  return (
    <>
      <DynamicBadgeMaker
        baseUrl={baseUrl}
        datatype={datatype}
        setDatatype={setDatatype}
      />
      <p>
        <StyledCode>
          <DynamicBadgeFormat baseUrl={baseUrl} datatype={datatype} />
        </StyledCode>
      </p>
    </>
  )
}
