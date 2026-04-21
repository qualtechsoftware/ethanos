import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import { useApp } from './context/useApp'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TaskLogPage from './pages/TaskLogPage'
import AdminUsersPage from './pages/AdminUsersPage'
import './App.css'

function Protected({ children }) {
  const { currentUser } = useApp()
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function TaskLogRoute() {
  const { currentUser } = useApp()
  const serverKey = currentUser.backendUserId ?? 'default'
  return <TaskLogPage key={`${currentUser.id}-${serverKey}`} />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<TaskLogRoute />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
