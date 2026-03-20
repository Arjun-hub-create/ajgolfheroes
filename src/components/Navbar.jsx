import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Heart, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const links = [
  { label: 'How it Works', href: '/#how' },
  { label: 'Charities',    href: '/charities' },
  { label: 'Monthly Draw', href: '/draw' },
  { label: 'Dashboard',    href: '/dashboard' },
]

export default function Navbar() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setDropOpen(false) }, [pathname])

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out!')
    navigate('/')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-dark-900/90 backdrop-blur-2xl border-b border-white/6' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30"
            >
              <Trophy size={17} className="text-white" />
            </motion.div>
            <span className="font-bold text-white text-lg tracking-tight">
              AJGolf<span className="gradient-text">Heroes</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-white bg-white/8'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-white/70 text-sm font-medium max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-dark-700 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-semibold truncate">
                          {user.user_metadata?.full_name || 'Golfer'}
                        </p>
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/subscribe" className="btn-primary text-sm py-2 px-5">
                  <Heart size={14} /> Join & Give
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-dark-800/95 backdrop-blur-2xl border-b border-white/8 px-6 py-6 flex flex-col gap-2 md:hidden"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={link.href}
                  className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
              {user ? (
                <button onClick={handleSignOut} className="btn-outline text-sm text-center text-red-400 border-red-500/20">
                  <LogOut size={14} /> Sign out
                </button>
              ) : (
                <>
                  <Link to="/login"     className="btn-outline text-sm text-center">Sign in</Link>
                  <Link to="/subscribe" className="btn-primary text-sm text-center"><Heart size={14} />Join & Give</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}