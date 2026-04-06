'use client'

/**
 * SearchInput — isolated, memo'd search input.
 *
 * Owns its own value state so the parent NEVER re-renders on each keystroke.
 * Debounces onSearch (default 300ms). Calls onSubmit immediately on Enter/button.
 *
 * WKWebView / iOS keyboard safety: the component must not be inside any
 * conditional or animated block that re-evaluates during typing. Mount it
 * unconditionally in its final DOM position and it will never trigger an
 * RTIInputSystemClient session reset.
 */

import { useState, useEffect, useRef, memo } from 'react'

type SearchInputProps = {
  /** Called with debounced value as user types. Never causes parent re-render. */
  onSearch?: (value: string) => void
  /** Called immediately when user presses Enter or clicks the submit button. */
  onSubmit?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  inputStyle?: React.CSSProperties
  initialValue?: string
}

export const SearchInput = memo(function SearchInput({
  onSearch,
  onSubmit,
  placeholder = 'Search...',
  debounceMs = 300,
  inputStyle,
  initialValue = '',
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)

  // Use a ref so the debounce effect never needs to re-run because the
  // callback reference changed. Parent can inline the handler safely.
  const onSearchRef = useRef(onSearch)
  const onSubmitRef = useRef(onSubmit)
  useEffect(() => { onSearchRef.current = onSearch }, [onSearch])
  useEffect(() => { onSubmitRef.current = onSubmit }, [onSubmit])

  // Debounce: only fires after user pauses, not on every keystroke
  useEffect(() => {
    if (!onSearchRef.current) return
    const t = setTimeout(() => onSearchRef.current?.(value), debounceMs)
    return () => clearTimeout(t)
  }, [value, debounceMs])

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSubmitRef.current?.(value)
      }}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="on"
      style={inputStyle}
    />
  )
})
