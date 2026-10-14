import { useState, type FormEvent } from 'react'
import { formatDue, isOverdue } from '../dates'
import type { Priority, Task } from '../types'
import Icon from './Icon'

interface Props {
  task: Task
  onUpdate: (patch: Partial<Task>) => void
  onDelete: () => void
}

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [priority, setPriority] = useState<Priority>(task.priority)

  function startEditing() {
    setTitle(task.title)
    setNotes(task.notes)
    setDueDate(task.dueDate ?? '')
    setPriority(task.priority)
    setEditing(true)
  }

  function save(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onUpdate({ title: title.trim(), notes, dueDate: dueDate || null, priority })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="task editing">
        <form onSubmit={save} className="task-edit">
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus aria-label="Title" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} />
          <div className="task-edit-row">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" />
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <span className="spacer" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm">Save</button>
          </div>
        </form>
      </li>
    )
  }

  const overdue = !task.completed && isOverdue(task.dueDate)

  return (
    <li className={`task ${task.completed ? 'done' : ''}`}>
      <button
        className={`checkbox ${task.completed ? 'checked' : ''}`}
        onClick={() => onUpdate({ completed: !task.completed })}
        aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
      >
        <Icon name="check" size={14} />
      </button>

      <div className="task-body" onDoubleClick={startEditing}>
        <div className="task-title">{task.title}</div>
        {task.notes && <div className="task-notes">{task.notes}</div>}
        <div className="task-meta">
          <span className={`priority ${task.priority}`}>
            <Icon name="flag" size={12} /> {task.priority}
          </span>
          {task.dueDate && (
            <span className={`due ${overdue ? 'overdue' : ''}`}>
              <Icon name="calendar" size={12} /> {overdue ? 'Overdue · ' : ''}{formatDue(task.dueDate)}
            </span>
          )}
          {task.createdByName && <span className="muted">by {task.createdByName}</span>}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={startEditing} aria-label="Edit task"><Icon name="edit" size={16} /></button>
        <button className="icon-btn danger" onClick={onDelete} aria-label="Delete task"><Icon name="trash" size={16} /></button>
      </div>
    </li>
  )
}
