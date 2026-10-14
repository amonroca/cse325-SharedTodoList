export interface User {
  id: number
  name: string
  email: string
}

export type Role = 'owner' | 'editor'
export type Priority = 'low' | 'medium' | 'high'

export interface TodoList {
  id: number
  name: string
  color: string
  ownerId: number
  role: Role
  taskCount: number
  doneCount: number
  memberCount: number
}

export interface Member extends User {
  role: Role
}

export interface Task {
  id: number
  listId: number
  title: string
  notes: string
  dueDate: string | null
  priority: Priority
  completed: boolean
  createdAt: string
  updatedAt: string
  createdByName: string | null
}
