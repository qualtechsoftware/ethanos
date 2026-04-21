/** Inline SVG icons (stroke). Pass className for color via currentColor. */

function Svg({ size = 20, className = '', children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ui-icon ${className}`.trim()}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconLayers({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Svg>
  )
}

export function IconClipboard({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </Svg>
  )
}

export function IconClipboardList({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </Svg>
  )
}

export function IconClock({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Svg>
  )
}

export function IconCalendar({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  )
}

export function IconBuilding({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </Svg>
  )
}

export function IconHistory({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </Svg>
  )
}

export function IconRefresh({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Svg>
  )
}

export function IconCirclePlus({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </Svg>
  )
}

export function IconSave({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </Svg>
  )
}

export function IconUsers({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  )
}

export function IconLogOut({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  )
}

export function IconHexagon({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
    </Svg>
  )
}

export function IconUser({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  )
}

export function IconMenu({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </Svg>
  )
}

export function IconX({ size, className }) {
  return (
    <Svg size={size} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  )
}
