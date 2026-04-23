import { useState } from 'react'

export function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  rightElement,
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const isFloated = focused || (value && value.length > 0)

  return (
    <div style={{ position: 'relative', marginBottom: error ? '0.25rem' : '0', width: '100%' }}>
      <div className="text-gray-900 dark:text-gray-100" style={{
        position: 'relative',
        border: `1.5px solid ${
          error ? '#ef4444' : focused ? '#6366f1' : 'var(--input-border, #d1d5db)'
        }`,
        borderRadius: '12px',
        background: 'transparent',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        width: '100%',
      }}>
        <label style={{
          position: 'absolute',
          left: '1rem',
          top: isFloated ? '-0.6rem' : '50%',
          transform: isFloated ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloated ? '0.72rem' : '0.95rem',
          color: focused ? '#6366f1' : 'var(--input-label, #9ca3af)',
          background: 'var(--input-bg, #f9fafb)',
          padding: isFloated ? '0 0.3rem' : '0',
          pointerEvents: 'none',
          transition: 'all 0.18s ease',
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </label>

        <input
          className="w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none border-none"
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=""
          style={{
            padding: isFloated ? '1.4rem 3rem 0.6rem 1rem' : '1rem 3rem 1rem 1rem',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
            transition: 'padding 0.18s ease',
            caretColor: 'var(--input-text, #111827)'
          }}
          {...props}
        />

        {rightElement && (
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}>
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', paddingLeft: '0.5rem' }}>
          {error}
        </p>
      )}
    </div>
  )
}
