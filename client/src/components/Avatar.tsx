const palette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#14b8a6']

export default function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
  const color = palette[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % palette.length]

  return (
    <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.4 }} title={name}>
      {initials}
    </span>
  )
}
