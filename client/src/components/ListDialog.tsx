import { useState, type FormEvent } from 'react'
import Modal from './Modal'

export const LIST_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#64748b']

interface Props {
  title: string
  initialName?: string
  initialColor?: string
  submitLabel: string
  onSubmit: (name: string, color: string) => Promise<void>
  onClose: () => void
}

export default function ListDialog({ title, initialName = '', initialColor = LIST_COLORS[0], submitLabel, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onSubmit(name.trim(), color)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save list')
      setBusy(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="modal-body">
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Group project" autoFocus required />
        </label>
        <div className="field">
          <span>Color</span>
          <div className="swatches">
            {LIST_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={`swatch ${c === color ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <div className="alert">{error}</div>}
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy || !name.trim()}>{busy ? 'Saving…' : submitLabel}</button>
        </footer>
      </form>
    </Modal>
  )
}
