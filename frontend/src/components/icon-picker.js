import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import inputStyles from 'docusaurus-theme-openapi/lib/theme/ApiDemoPanel/FormTextInput/styles.module.css'
import styles from './icon-picker.module.css'

const rowHeight = 56
const viewportHeight = 280
const overscan = 3
const catalogs = new Map()

async function loadCatalog(baseUrl) {
  if (!catalogs.has(baseUrl)) {
    const request = (async () => {
      try {
        const response = await fetch(`${baseUrl}/data/simple-icons.json`, {
          signal: AbortSignal.timeout(15000),
        })
        if (!response.ok) throw new Error('Unable to load icons')
        const data = await response.json()
        if (
          !Array.isArray(data) ||
          !data.every(
            icon =>
              typeof icon.title === 'string' &&
              typeof icon.slug === 'string' &&
              /^[a-z0-9_]+$/.test(icon.slug),
          )
        )
          throw new Error('Invalid icon catalog')
        return data.map(({ title, slug }) => ({ title, slug }))
      } catch (error) {
        catalogs.delete(baseUrl)
        throw error
      }
    })()
    catalogs.set(baseUrl, request)
  }
  return catalogs.get(baseUrl)
}

export default function IconPicker({ value, onChange }) {
  const { siteConfig } = useDocusaurusContext()
  const baseUrl = `https://cdn.jsdelivr.net/npm/simple-icons@${siteConfig.customFields.simpleIconsVersion}`
  const id = useId()
  const input = useRef(null)
  const list = useRef(null)
  const [open, setOpen] = useState(false)
  const [icons, setIcons] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [active, setActive] = useState(-1)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    let current = true
    async function load() {
      setError(false)
      try {
        const catalog = await loadCatalog(baseUrl)
        if (current) setIcons(catalog)
      } catch {
        if (current) setError(true)
      }
    }
    load()
    return () => {
      current = false
    }
  }, [open, baseUrl, attempt])

  const query = value.trim().toLowerCase()
  const matches = useMemo(
    () =>
      (icons ?? []).filter(
        icon =>
          icon.title.toLowerCase().includes(query) || icon.slug.includes(query),
      ),
    [icons, query],
  )
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(
    matches.length,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  )
  const visible = matches.slice(start, end)

  function resetScroll() {
    if (list.current) list.current.scrollTop = 0
    setScrollTop(0)
  }

  function openPicker() {
    if (!open) {
      resetScroll()
      setActive(-1)
      setOpen(true)
    }
  }

  function select(slug) {
    onChange(slug)
    input.current.focus()
    setOpen(false)
    setActive(-1)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActive(-1)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) resetScroll()
      setOpen(true)
      const next =
        event.key === 'ArrowDown'
          ? Math.min(active + 1, matches.length - 1)
          : Math.max(active - 1, 0)
      setActive(next)
      if (list.current && next >= 0) {
        const top = next * rowHeight
        const bottom = top + rowHeight
        if (top < list.current.scrollTop) list.current.scrollTop = top
        else if (bottom > list.current.scrollTop + viewportHeight) {
          list.current.scrollTop = bottom - viewportHeight
        }
        setScrollTop(list.current.scrollTop)
      }
    } else if (event.key === 'Enter' && open && matches[active]) {
      event.preventDefault()
      select(matches[active].slug)
    }
  }

  return (
    <div
      className={styles.picker}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
          setActive(-1)
        }
      }}
    >
      <input
        ref={input}
        className={inputStyles.input}
        role="combobox"
        aria-label="Logo"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={
          open && active >= start && active < end
            ? `${id}-${active}`
            : undefined
        }
        aria-describedby={open ? `${id}-status` : undefined}
        autoComplete="off"
        placeholder="Search icons or enter a logo slug"
        value={value}
        onFocus={openPicker}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onChange={event => {
          onChange(event.target.value)
          setActive(-1)
          resetScroll()
          setOpen(true)
        }}
      />
      {open && (
        <div className={styles.menu}>
          <div id={`${id}-status`} role="status" className={styles.status}>
            {error
              ? 'Could not load icons. You can still enter a logo slug.'
              : !icons
                ? 'Loading icons…'
                : matches.length === 0
                  ? 'No matching icons. You can still enter a logo slug.'
                  : `${matches.length} icons — search by name or slug`}
          </div>
          {error && (
            <button
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                input.current.focus()
                setAttempt(attempt => attempt + 1)
              }}
            >
              Retry
            </button>
          )}
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-label="Icons"
            className={styles.list}
            onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
          >
            <li
              role="presentation"
              aria-hidden="true"
              style={{ height: start * rowHeight }}
            />
            {visible.map((icon, index) => (
              <li
                key={icon.slug}
                id={`${id}-${start + index}`}
                role="option"
                aria-selected={active === start + index}
                aria-posinset={start + index + 1}
                aria-setsize={matches.length}
                style={{ height: rowHeight }}
                className={styles.option}
                onMouseDown={event => event.preventDefault()}
                onClick={() => select(icon.slug)}
              >
                <img
                  src={`${baseUrl}/icons/${icon.slug}.svg`}
                  alt=""
                  width="24"
                  height="24"
                  loading="lazy"
                />
                <span
                  className={styles.name}
                  title={`${icon.title} (${icon.slug})`}
                >
                  {icon.title}
                  <small>{icon.slug}</small>
                </span>
              </li>
            ))}
            <li
              role="presentation"
              aria-hidden="true"
              style={{ height: (matches.length - end) * rowHeight }}
            />
          </ul>
        </div>
      )}
    </div>
  )
}
