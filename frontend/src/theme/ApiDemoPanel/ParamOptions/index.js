import IconPicker from '@site/src/components/icon-picker'
import React, { useState } from 'react'
import { nanoid } from '@reduxjs/toolkit'
import FormItem from '@theme/ApiDemoPanel/FormItem'
import FormMultiSelect from '@theme/ApiDemoPanel/FormMultiSelect'
import FormSelect from '@theme/ApiDemoPanel/FormSelect'
import FormTextInput from '@theme/ApiDemoPanel/FormTextInput'
import { setParam } from '@theme/ApiDemoPanel/ParamOptions/slice'
import styles from 'docusaurus-theme-openapi/lib/theme/ApiDemoPanel/ParamOptions/styles.module.css'
import { useTypedDispatch, useTypedSelector } from '@theme/ApiDemoPanel/hooks'
function LogoParam({ param }) {
  const dispatch = useTypedDispatch()
  return (
    <IconPicker
      value={param.value ?? ''}
      onChange={value =>
        dispatch(setParam({ ...param, value: value || undefined }))
      }
    />
  )
}

function ParamOption({ param }) {
  if (param.in === 'query' && param.name === 'logo') {
    return <LogoParam param={param} />
  }
  if (param.schema?.type === 'array' && param.schema.items?.enum) {
    return <ParamMultiSelectFormItem param={param} />
  }
  if (param.schema?.type === 'array') {
    return <ParamArrayFormItem param={param} />
  }
  if (param.schema?.enum) {
    return <ParamSelectFormItem param={param} />
  }
  if (param.schema?.type === 'boolean') {
    return <ParamBooleanFormItem param={param} />
  }

  // integer, number, string, int32, int64, float, double, object, byte, binary,
  // date-time, date, password
  return <ParamTextFormItem param={param} />
}
function ParamOptionWrapper({ param }) {
  return (
    <FormItem label={param.name} type={param.in}>
      <ParamOption param={param} />
    </FormItem>
  )
}
function ParamOptions() {
  const [showOptional, setShowOptional] = useState(false)
  const pathParams = useTypedSelector(state => state.params.path)
  const queryParams = useTypedSelector(state => state.params.query)
  const cookieParams = useTypedSelector(state => state.params.cookie)
  const headerParams = useTypedSelector(state => state.params.header)
  const allParams = [
    ...pathParams,
    ...queryParams,
    ...cookieParams,
    ...headerParams,
  ]
  const requiredParams = allParams.filter(p => p.required)
  const optionalParams = allParams.filter(p => !p.required)
  return (
    <>
      {/* Required Parameters */}
      {requiredParams.map(param => (
        <ParamOptionWrapper key={`${param.in}-${param.name}`} param={param} />
      ))}

      {/* Optional Parameters */}
      {optionalParams.length > 0 && (
        <>
          <button
            className={styles.showMoreButton}
            type="button"
            onClick={() => setShowOptional(prev => !prev)}
          >
            <span
              style={{
                width: '1.5em',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              <span
                className={showOptional ? styles.plusExpanded : styles.plus}
              >
                <div>
                  <svg
                    style={{
                      fill: 'currentColor',
                      width: '10px',
                      height: '10px',
                    }}
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 7h6a1 1 0 0 1 0 2H9v6a1 1 0 0 1-2 0V9H1a1 1 0 1 1 0-2h6V1a1 1 0 1 1 2 0z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </span>
            </span>
            {showOptional
              ? 'Hide optional parameters'
              : 'Show optional parameters'}
          </button>

          <div
            className={showOptional ? styles.showOptions : styles.hideOptions}
          >
            {optionalParams.map(param => (
              <ParamOptionWrapper
                key={`${param.in}-${param.name}`}
                param={param}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
function ArrayItem({ param, onChange }) {
  if (param.schema?.items?.type === 'boolean') {
    return (
      <FormSelect
        options={['---', 'true', 'false']}
        onChange={e => {
          const val = e.target.value
          onChange(val === '---' ? undefined : val)
        }}
      />
    )
  }
  return (
    <FormTextInput
      placeholder={param.description || param.name}
      onChange={e => {
        onChange(e.target.value)
      }}
    />
  )
}
function ParamArrayFormItem({ param }) {
  const [items, setItems] = useState([])
  const dispatch = useTypedDispatch()
  function handleAddItem() {
    if (
      param?.schema?.maxItems !== undefined &&
      items.length >= param.schema.maxItems
    ) {
      return
    }
    setItems(i => [
      ...i,
      {
        id: nanoid(),
      },
    ])
  }
  function updateItems(items) {
    const values = items.map(item => item.value).filter(item => !!item)
    dispatch(
      setParam({
        ...param,
        value: values.length > 0 ? values : undefined,
      }),
    )
  }
  function handleDeleteItem(itemToDelete) {
    return () => {
      const newItems = items.filter(i => i.id !== itemToDelete.id)
      setItems(newItems)
      updateItems(newItems)
    }
  }
  function handleChangeItem(itemToUpdate) {
    return value => {
      const newItems = items.map(i => {
        if (i.id === itemToUpdate.id) {
          return {
            ...i,
            value,
          }
        }
        return i
      })
      setItems(newItems)
      updateItems(newItems)
    }
  }
  return (
    <>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            display: 'flex',
          }}
        >
          <ArrayItem param={param} onChange={handleChangeItem(item)} />
          <button
            className={styles.buttonDelete}
            type="button"
            onClick={handleDeleteItem(item)}
          >
            <svg
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              width="16"
              height="16"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"></path>
              <title>Delete</title>
            </svg>
          </button>
        </div>
      ))}
      <button
        className={styles.buttonThin}
        type="button"
        onClick={handleAddItem}
        disabled={
          param?.schema?.maxItems != null &&
          items.length >= param.schema.maxItems
        }
      >
        Add item
      </button>
    </>
  )
}
function ParamSelectFormItem({ param }) {
  const dispatch = useTypedDispatch()
  const options = param.schema?.enum ?? []
  return (
    <FormSelect
      options={['---', ...options]}
      onChange={e => {
        const val = e.target.value
        dispatch(
          setParam({
            ...param,
            value: val === '---' ? undefined : val,
          }),
        )
      }}
    />
  )
}
function ParamBooleanFormItem({ param }) {
  const dispatch = useTypedDispatch()
  return (
    <FormSelect
      options={['---', 'true', 'false']}
      onChange={e => {
        const val = e.target.value
        dispatch(
          setParam({
            ...param,
            value: val === '---' ? undefined : val,
          }),
        )
      }}
    />
  )
}
function ParamMultiSelectFormItem({ param }) {
  const dispatch = useTypedDispatch()
  const options = param.schema?.items?.enum ?? []
  return (
    <FormMultiSelect
      options={options}
      onChange={e => {
        const values = Array.prototype.filter
          .call(e.target.options, o => o.selected)
          .map(o => o.value)
        dispatch(
          setParam({
            ...param,
            value: values.length > 0 ? values : undefined,
          }),
        )
      }}
    />
  )
}
function ParamTextFormItem({ param }) {
  const dispatch = useTypedDispatch()
  return (
    <FormTextInput
      placeholder={param.description || param.name}
      onChange={e =>
        dispatch(
          setParam({
            ...param,
            value: e.target.value,
          }),
        )
      }
    />
  )
}
export default ParamOptions
