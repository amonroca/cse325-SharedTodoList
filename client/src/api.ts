import type { Member, Task, TodoList, User } from './types'

const TOKEN_KEY = 'shared-todo-token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Request failed')
  return data as T
}

const json = (method: string, body?: unknown): RequestInit => ({ method, body: JSON.stringify(body ?? {}) })

type AuthResponse = { token: string; user: User }

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', json('POST', { name, email, password })),
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', json('POST', { email, password })),
  me: () => request<User>('/me'),

  lists: () => request<TodoList[]>('/lists'),
  createList: (name: string, color: string) => request<TodoList>('/lists', json('POST', { name, color })),
  updateList: (id: number, patch: { name?: string; color?: string }) => request<TodoList>(`/lists/${id}`, json('PATCH', patch)),
  deleteList: (id: number) => request<void>(`/lists/${id}`, { method: 'DELETE' }),

  members: (listId: number) => request<Member[]>(`/lists/${listId}/members`),
  addMember: (listId: number, email: string) => request<Member>(`/lists/${listId}/members`, json('POST', { email })),
  removeMember: (listId: number, userId: number) => request<void>(`/lists/${listId}/members/${userId}`, { method: 'DELETE' }),

  tasks: (listId: number) => request<Task[]>(`/lists/${listId}/tasks`),
  createTask: (listId: number, task: Partial<Task>) => request<Task>(`/lists/${listId}/tasks`, json('POST', task)),
  updateTask: (id: number, patch: Partial<Task>) => request<Task>(`/tasks/${id}`, json('PATCH', patch)),
  deleteTask: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
