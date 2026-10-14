import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import type { Member, TodoList } from '../types'
import Avatar from './Avatar'
import Modal from './Modal'

interface Props {
  list: TodoList
  currentUserId: number
  onClose: () => void
  onChanged: () => void
  onLeft: () => void
}

export default function ShareDialog({ list, currentUserId, onClose, onChanged, onLeft }: Props) {
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isOwner = list.role === 'owner'

  useEffect(() => {
    api.members(list.id).then(setMembers).catch((err) => setError(err.message))
  }, [list.id])

  async function invite(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const member = await api.addMember(list.id, email)
      setMembers((prev) => (prev.some((m) => m.id === member.id) ? prev : [...prev, member]))
      setEmail('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not share list')
    } finally {
      setBusy(false)
    }
  }

  async function remove(member: Member) {
    await api.removeMember(list.id, member.id)
    if (member.id === currentUserId) {
      onLeft()
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    onChanged()
  }

  return (
    <Modal title={`Share “${list.name}”`} onClose={onClose}>
      <div className="modal-body">
        {isOwner ? (
          <form className="invite-row" onSubmit={invite}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invite by email" required autoFocus />
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Adding…' : 'Invite'}</button>
          </form>
        ) : (
          <p className="muted small">Only the owner can invite people to this list.</p>
        )}
        {error && <div className="alert">{error}</div>}

        <h3 className="section-label">People with access</h3>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.id}>
              <Avatar name={m.name} />
              <div className="member-info">
                <strong>{m.name}{m.id === currentUserId && ' (you)'}</strong>
                <span className="muted small">{m.email}</span>
              </div>
              <span className={`role-badge ${m.role}`}>{m.role}</span>
              {m.role !== 'owner' && (isOwner || m.id === currentUserId) && (
                <button className="btn btn-ghost btn-sm danger" onClick={() => remove(m)}>
                  {m.id === currentUserId ? 'Leave' : 'Remove'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
