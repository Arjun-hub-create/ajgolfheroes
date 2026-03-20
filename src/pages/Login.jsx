import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back! 🏌️')
        navigate('/dashboard')
      }
    } else {
      if (name.trim().length < 2) {
        toast.error('Please enter your full name')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } }
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Check your email to confirm.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6 pt-16">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/6 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">
              AJGolf<span className="gradient-text">Heroes</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === 'login' ? 'Welcome back 👋' : 'Join the club 🏌️'}
          </h1>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'Start playing with purpose today'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl bg-dark-700 p-1 mb-6 border border-white/8">
          {['login', 'signup'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              Email address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-white/25 text-xs mt-1.5">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        <p className="text-center text-white/20 text-xs mt-4">
          By signing up you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  )
}