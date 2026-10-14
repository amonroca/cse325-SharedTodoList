import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'
import ListDialog from '../components/ListDialog'
import Modal from '../components/Modal'
import ShareDialog from '../components/ShareDialog'
import TaskComposer from '../components/TaskComposer'
import TaskItem from '../components/TaskItem'
import type { Task, TodoList } from '../types'

type Filter = 'all' | 'active' | 'done'
type Dialog = null | 'new-list' | 'edit-list' | 'share' | 'delete-list'

// How often to re-fetch so changes from collaborators show up.
const POLL_MS = 5000

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [lists, setLists] = useState<TodoList[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState('')

  const activeList = lists.find((l) => l.id === activeId) ?? null

  const loadLists = useCallback(async () => {
    const data = await api.lists()
    setLists(data)
    setActiveId((current) => (current && data.some((l) => l.id === current) ? current : (data[0]?.id ?? null)))
  }, [])

  const loadTasks = useCallback(async (listId: number) => {
    setTasks(await api.tasks(listId))
  }, [])

  useEffect(() => {
    loadLists().catch((err) => setError(err.message))
  }, [loadLists])

  useEffect(() => {
    if (activeId == null) {
      setTasks([])
      return
    }
    setLoadingTasks(true)
    loadTasks(activeId)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTasks(false))
  }, [activeId, loadTasks])

  // Poll for collaborator changes while the tab is visible.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return
      loadLists().catch(() => {})
      if (activeId != null) loadTasks(activeId).catch(() => {})
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [activeId, loadLists, loadTasks])

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      if (filter === 'active' && t.completed) return false
      if (filter === 'done' && !t.completed) return false
      return !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
    })
  }, [tasks, filter, search])

  const doneCount = tasks.filter((t) => t.completed).length
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  function selectList(id: number) {
    setActiveId(id)
    setSidebarOpen(false)
    setSearch('')
    setFilter('all')
  }

  async function run(action: () => Promise<unknown>) {
    try {
      setError('')
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      if (activeId != null) loadTasks(activeId).catch(() => {})
    }
  }

  // Task handlers update the UI immediately, then sync with the server.
  const addTask = async (input: Partial<Task>) => {
    if (activeId == null) return
    await run(async () => {
      const task = await api.createTask(activeId, input)
      setTasks((prev) => [task, ...prev])
      loadLists()
    })
  }

  const updateTask = (task: Task, patch: Partial<Task>) =>
    run(async () => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)))
      const updated = await api.updateTask(task.id, patch)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      if ('completed' in patch) loadLists()
    })

  const deleteTask = (task: Task) =>
    run(async () => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      await api.deleteTask(task.id)
      loadLists()
    })

  const clearCompleted = () =>
    run(async () => {
      const done = tasks.filter((t) => t.completed)
      setTasks((prev) => prev.filter((t) => !t.completed))
      await Promise.all(done.map((t) => api.deleteTask(t.id)))
      loadLists()
    })

  const ownedLists = lists.filter((l) => l.role === 'owner')
  const sharedLists = lists.filter((l) => l.role !== 'owner')

  const renderListLink = (l: TodoList) => (
    <li key={l.id}>
      <button className={`list-link ${l.id === activeId ? 'active' : ''}`} onClick={() => selectList(l.id)}>
        <span className="list-dot" style={{ background: l.color }} />
        <span className="list-name">{l.name}</span>
        {l.memberCount > 1 && <Icon name="users" size={14} />}
        <span className="count">{l.taskCount - l.doneCount}</span>
      </button>
    </li>
  )

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark"><Icon name="check" size={18} /></span>
            Shared Todo
          </div>
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <button className="btn btn-primary btn-block" onClick={() => setDialog('new-list')}>
          <Icon name="plus" size={16} /> New list
        </button>

        <nav className="list-nav">
          <h3 className="section-label">My lists</h3>
          <ul>{ownedLists.map(renderListLink)}</ul>
          {ownedLists.length === 0 && <p className="muted small pad">No lists yet.</p>}

          {sharedLists.length > 0 && (
            <>
              <h3 className="section-label">Shared with me</h3>
              <ul>{sharedLists.map(renderListLink)}</ul>
            </>
          )}
        </nav>

        <div className="user-card">
          <Avatar name={user!.name} />
          <div className="member-info">
            <strong>{user!.name}</strong>
            <span className="muted small">{user!.email}</span>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Sign out" title="Sign out">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          {activeList ? (
            <>
              <div className="title-block">
                <h1>
                  <span className="list-dot lg" style={{ background: activeList.color }} />
                  {activeList.name}
                </h1>
                <p className="muted small">
                  {tasks.length - doneCount} open · {doneCount} done
                  {activeList.memberCount > 1 && ` · shared with ${activeList.memberCount - 1}`}
                </p>
              </div>
              <div className="topbar-actions">
                <button className="btn btn-ghost" onClick={() => setDialog('share')}>
                  <Icon name="share" size={16} /> <span className="hide-sm">Share</span>
                </button>
                {activeList.role === 'owner' && (
                  <>
                    <button className="icon-btn" onClick={() => setDialog('edit-list')} aria-label="Rename list" title="Edit list">
                      <Icon name="edit" />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDialog('delete-list')} aria-label="Delete list" title="Delete list">
                      <Icon name="trash" />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="title-block"><h1>Shared Todo</h1></div>
          )}
        </header>

        {error && (
          <div className="alert dismissable">
            {error}
            <button className="icon-btn" onClick={() => setError('')} aria-label="Dismiss"><Icon name="x" size={16} /></button>
          </div>
        )}

        {activeList ? (
          <div className="content">
            <div className="progress" aria-label={`${progress}% complete`}>
              <div className="progress-bar" style={{ width: `${progress}%`, background: activeList.color }} />
            </div>

            <TaskComposer onAdd={addTask} />

            <div className="toolbar">
              <div className="segmented" role="tablist">
                {(['all', 'active', 'done'] as const).map((f) => (
                  <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
                  </button>
                ))}
              </div>
              <label className="search">
                <Icon name="search" size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks" />
              </label>
            </div>

            {loadingTasks && tasks.length === 0 ? (
              <div className="empty"><div className="spinner" /></div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><Icon name="check" size={28} /></div>
                <h3>{tasks.length === 0 ? 'No tasks yet' : 'Nothing here'}</h3>
                <p className="muted">
                  {tasks.length === 0 ? 'Add your first task above to get started.' : 'Try a different filter or search.'}
                </p>
              </div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((t) => (
                  <TaskItem key={t.id} task={t} onUpdate={(patch) => updateTask(t, patch)} onDelete={() => deleteTask(t)} />
                ))}
              </ul>
            )}

            {doneCount > 0 && filter !== 'active' && (
              <button className="link-btn clear-done" onClick={clearCompleted}>Clear {doneCount} completed</button>
            )}
          </div>
        ) : (
          <div className="empty big">
            <div className="empty-icon"><Icon name="list" size={32} /></div>
            <h3>Create your first list</h3>
            <p className="muted">Lists keep related tasks together. Share them with anyone who has an account.</p>
            <button className="btn btn-primary" onClick={() => setDialog('new-list')}><Icon name="plus" size={16} /> New list</button>
          </div>
        )}
      </main>

      {dialog === 'new-list' && (
        <ListDialog
          title="New list"
          submitLabel="Create list"
          onClose={() => setDialog(null)}
          onSubmit={async (name, color) => {
            const list = await api.createList(name, color)
            setLists((prev) => [...prev, list])
            selectList(list.id)
          }}
        />
      )}

      {dialog === 'edit-list' && activeList && (
        <ListDialog
          title="Edit list"
          submitLabel="Save"
          initialName={activeList.name}
          initialColor={activeList.color}
          onClose={() => setDialog(null)}
          onSubmit={async (name, color) => {
            await api.updateList(activeList.id, { name, color })
            await loadLists()
          }}
        />
      )}

      {dialog === 'share' && activeList && (
        <ShareDialog
          list={activeList}
          currentUserId={user!.id}
          onClose={() => setDialog(null)}
          onChanged={() => loadLists()}
          onLeft={() => {
            setDialog(null)
            setActiveId(null)
            loadLists()
          }}
        />
      )}

      {dialog === 'delete-list' && activeList && (
        <Modal title="Delete list?" onClose={() => setDialog(null)}>
          <div className="modal-body">
            <p>
              <strong>{activeList.name}</strong> and its {activeList.taskCount} task{activeList.taskCount === 1 ? '' : 's'} will be
              permanently deleted for everyone it's shared with.
            </p>
            <footer className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() =>
                  run(async () => {
                    await api.deleteList(activeList.id)
                    setDialog(null)
                    setActiveId(null)
                    await loadLists()
                  })
                }
              >
                Delete list
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </div>
  )
}
