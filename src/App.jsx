import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Charities from './pages/Charities'
import Draw from './pages/Draw'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  useAuth()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#080808' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#080808' } },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/draw"      element={<Draw />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}