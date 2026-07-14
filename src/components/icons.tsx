import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

const baseProps: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
}

export function SearchIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
}

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return <svg {...baseProps} {...props} fill={filled ? "currentColor" : "none"}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
}

export function BagIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
}

export function MenuIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
}

export function CloseIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>
}

export function ArrowIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M5 12h14M14 7l5 5-5 5"/></svg>
}

export function EyeIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
}

export function MinusIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M5 12h14"/></svg>
}

export function PlusIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M12 5v14M5 12h14"/></svg>
}

export function TrashIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>
}

export function SparkIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M12 2l1.5 5.1L18 9l-4.5 1.9L12 16l-1.5-5.1L6 9l4.5-1.9L12 2ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>
}
