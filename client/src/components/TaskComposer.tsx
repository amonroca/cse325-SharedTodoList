import { useState, type FormEvent } from 'react'
import type { Priority } from '../types'
import Icon from './Icon'

interface Props {
  onAdd: (task: { title: string; dueDate: string | null; priority: Priority }) => Promise<void>
}

export default function TaskComposer({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      await onAdd({ title: title.trim(), dueDate: dueDate || null, priority })
      setTitle('')
      setDueDate('')
      setPriority('medium')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <span className="composer-plus"><Icon name="plus" /></span>
      <input
        className="composer-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task and press Enter"
        aria-label="New task title"
      />
      <div className="composer-meta">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn btn-primary" disabled={busy || !title.trim()}>Add</button>
      </div>
    </form>
  )
}
