import { useCallback, useMemo, useState, useEffect } from 'react'
import { AppContext } from './appContext'
import { postSignIn } from '../api/signIn'
import { postSignUp } from '../api/signUp'
import { postTimeEntry } from '../api/timeEntries'

const STORAGE_USERS = 'ethanos_users'
const STORAGE_TASKS = 'ethanos_tasks'
const STORAGE_SESSION = 'ethanos_session'

const defaultAdmin = {
  id: 'user_admin_seed',
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Administrator',
  role: 'admin',
  jobTitle: 'Operations',
  department: 'HQ',
  /** Numeric id on the Spring server for GET /api/time-entries/user/{id} and POST body */
  backendUserId: 1,
  createdAt: new Date().toISOString(),
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    if (!raw) {
      const initial = [defaultAdmin]
      localStorage.setItem(STORAGE_USERS, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_USERS, JSON.stringify([defaultAdmin]))
      return [defaultAdmin]
    }
    return parsed
  } catch {
    return [defaultAdmin]
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_TASKS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [tasks, setTasks] = useState(loadTasks)
  const [sessionUserId, setSessionUserId] = useState(() => loadSession()?.userId ?? null)

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (sessionUserId) {
      localStorage.setItem(STORAGE_SESSION, JSON.stringify({ userId: sessionUserId }))
    } else {
      localStorage.removeItem(STORAGE_SESSION)
    }
  }, [sessionUserId])

  const currentUser = useMemo(() => {
    if (!sessionUserId) return null
    return users.find((u) => u.id === sessionUserId) ?? null
  }, [users, sessionUserId])

  const login = useCallback(async (email, password) => {
    const api = await postSignIn({ email, password })
    if (!api.ok) {
      return { ok: false, error: api.error }
    }
    const normalized = email.trim().toLowerCase()
    const user = users.find(
      (u) => u.email.toLowerCase() === normalized && u.password === password
    )
    if (!user) {
      return {
        ok: false,
        error:
          'Server saved sign-in, but this app has no matching user. Use a profile created here (e.g. demo admin) or add your account.',
      }
    }
    setSessionUserId(user.id)
    return { ok: true }
  }, [users])

  const logout = useCallback(() => {
    setSessionUserId(null)
  }, [])

  const signUp = useCallback(
    async ({ email, password, fullName, phone, role: signupRole }) => {
      const normalized = email.trim().toLowerCase()
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        return { ok: false, error: 'An account with this email already exists in the app.' }
      }
      const api = await postSignUp({ email, password, fullName, phone })
      if (!api.ok) {
        return { ok: false, error: api.error }
      }
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `user_${Date.now()}`
      const role = signupRole === 'admin' ? 'admin' : 'user'
      const user = {
        id,
        email: normalized,
        password,
        name: fullName.trim(),
        role,
        jobTitle: '',
        department: '',
        phone: String(phone).trim(),
        ...(Number.isFinite(Number(api.backendUserId))
          ? { backendUserId: Number(api.backendUserId) }
          : {}),
        createdAt: new Date().toISOString(),
      }
      setUsers((prev) => [...prev, user])
      return { ok: true }
    },
    [users]
  )

  const createUser = useCallback((details) => {
    const email = details.email.trim().toLowerCase()
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'A user with this email already exists.' }
    }
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `user_${Date.now()}`
    const user = {
      id,
      email,
      password: details.password,
      name: details.name.trim(),
      role: details.role === 'admin' ? 'admin' : 'user',
      jobTitle: details.jobTitle?.trim() || '',
      department: details.department?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, user])
    return { ok: true }
  }, [users])

  const addTaskEntry = useCallback(
    async (entry) => {
      if (!currentUser) {
        return { ok: false, error: 'You must be signed in to save an entry.' }
      }
      const serverUserId = Number.isFinite(Number(currentUser.backendUserId))
        ? Number(currentUser.backendUserId)
        : 1

      const api = await postTimeEntry({
        userId: serverUserId,
        taskDescription: entry.description.trim(),
        hours: Number(entry.hours),
        workDate: entry.date,
        clientName: entry.clientName.trim(),
      })
      if (!api.ok) {
        return { ok: false, error: api.error }
      }

      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `task_${Date.now()}`
      const row = {
        id,
        userId: currentUser.id,
        description: entry.description.trim(),
        hours: Number(entry.hours),
        date: entry.date,
        clientName: entry.clientName.trim(),
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [row, ...prev])
      return { ok: true, row }
    },
    [currentUser]
  )

  const myTasks = useMemo(() => {
    if (!currentUser) return []
    return tasks.filter((t) => t.userId === currentUser.id)
  }, [tasks, currentUser])

  const value = useMemo(
    () => ({
      users,
      tasks,
      currentUser,
      sessionUserId,
      login,
      logout,
      signUp,
      createUser,
      addTaskEntry,
      myTasks,
    }),
    [
      users,
      tasks,
      currentUser,
      sessionUserId,
      login,
      logout,
      signUp,
      createUser,
      addTaskEntry,
      myTasks,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
