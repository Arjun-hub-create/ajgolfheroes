import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Trophy, Heart, Zap, CheckCircle,
  XCircle, Play, BarChart2, RefreshCw,
  Shield, AlertCircle, ChevronDown, Eye
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { runRandomDraw } from '../lib/drawEngine'
import { splitPrizePool } from '../lib/prizePool'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab,    setActiveTab]    = useState('overview')
  const [drawNumbers,  setDrawNumbers]  = useState(null)
  const [simRunning,   setSimRunning]   = useState(false)
  const [publishing,   setPublishing]   = useState(false)
  const [drawType,     setDrawType]     = useState('random')
  const [users,        setUsers]        = useState([])
  const [winners,      setWinners]      = useState([])
  const [charities,    setCharities]    = useState([])
  const [stats,        setStats]        = useState({ users: 0, active: 0, pool: 0, charity: 0 })
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    checkAdmin()
    fetchStats()
    fetchUsers()
    fetchWinners()
    fetchCharities()
  }, [user])

  async function checkAdmin() {
    if (!user) { navigate('/login'); return }
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!data?.is_admin) {
      toast.error('Admin access required')
      navigate('/')
    }
  }

  async function fetchStats() {
    setLoading(true)
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('amount, charity_percentage')
      .eq('status', 'active')

    let totalPool = 0
    let totalCharity = 0
    subs?.forEach(s => {
      totalPool    += s.amount * 0.6
      totalCharity += (s.amount * s.charity_percentage) / 100
    })

    setStats({
      users:   userCount  || 0,
      active:  activeCount || 0,
      pool:    totalPool,
      charity: totalCharity,
    })
    setLoading(false)
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(plan, status, amount)')
      .order('created_at', { ascending: false })
      .limit(20)
    setUsers(data || [])
  }

  async function fetchWinners() {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_date)')
      .order('created_at', { ascending: false })
      .limit(20)
    setWinners(data || [])
  }

  async function fetchCharities() {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('total_raised', { ascending: false })
    setCharities(data || [])
  }

  async function runSimulation() {
    setSimRunning(true)
    setTimeout(() => {
      setDrawNumbers(runRandomDraw())
      setSimRunning(false)
      toast.success('Simulation complete!')
    }, 1500)
  }

  async function publishDraw() {
    if (!drawNumbers) { toast.error('Run a simulation first!'); return }
    setPublishing(true)
    const pools = splitPrizePool(stats.pool)
    const { error } = await supabase.from('draws').insert({
      draw_date:      new Date().toISOString().split('T')[0],
      numbers:        drawNumbers,
      prize_pool:     stats.pool,
      jackpot_amount: pools.jackpot,
      second_amount:  pools.second,
      third_amount:   pools.third,
      published:      true,
      draw_type:      drawType,
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Draw published! 🎉')
      setDrawNumbers(null)
    }
    setPublishing(false)
  }

  async function updateWinnerStatus(id, status) {
    const { error } = await supabase
      .from('winners')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(`Winner ${status}!`)
      fetchWinners()
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview',  icon: BarChart2 },
    { id: 'draw',     label: 'Draw',      icon: Trophy },
    { id: 'users',    label: 'Users',     icon: Users },
    { id: 'winners',  label: 'Winners',   icon: CheckCircle },
    { id: 'charity',  label: 'Charities', icon: Heart },
  ]

  const statCards = [
    { label: 'Total users',    value: loading ? '...' : stats.users,            icon: Users,    color: 'text-blue-400',   bg: 'from-blue-500/10' },
    { label: 'Active subs',    value: loading ? '...' : stats.active,           icon: Zap,      color: 'text-brand-400',  bg: 'from-brand-500/10' },
    { label: 'Prize pool',     value: loading ? '...' : `₹${Math.round(stats.pool).toLocaleString('en-IN')}`, icon: Trophy, color: 'text-amber-400', bg: 'from-amber-500/10' },
    { label: 'Charity total',  value: loading ? '...' : `₹${Math.round(stats.charity).toLocaleString('en-IN')}`, icon: Heart, color: 'text-rose-400', bg: 'from-rose-500/10' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Shield size={16} className="text-brand-400" />
            </div>
            <span className="label-tag">Admin panel</span>
          </div>
          <h1 className="text-4xl font-black text-white">Control Centre</h1>
          <p className="text-white/40 text-sm mt-1">Manage draws, users, winners and charities</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`stat-card bg-gradient-to-br ${bg} to-dark-800`}
            >
              <Icon size={18} className={`${color} mb-1`} />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl border border-white/8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-400" /> Platform Summary
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total registered users',   value: stats.users },
                  { label: 'Active subscribers',       value: stats.active },
                  { label: 'Inactive / cancelled',     value: stats.users - stats.active },
                  { label: 'Conversion rate',          value: stats.users ? `${Math.round((stats.active / stats.users) * 100)}%` : '0%' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{label}</span>
                    <span className="text-white font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Prize Pool Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total pool',         value: `₹${Math.round(stats.pool).toLocaleString('en-IN')}`,              color: 'text-white' },
                  { label: 'Jackpot (40%)',      value: `₹${Math.round(stats.pool * 0.40).toLocaleString('en-IN')}`,       color: 'text-amber-400' },
                  { label: '2nd tier (35%)',     value: `₹${Math.round(stats.pool * 0.35).toLocaleString('en-IN')}`,       color: 'text-slate-300' },
                  { label: '3rd tier (25%)',     value: `₹${Math.round(stats.pool * 0.25).toLocaleString('en-IN')}`,       color: 'text-orange-400' },
                  { label: 'Total charity',      value: `₹${Math.round(stats.charity).toLocaleString('en-IN')}`,           color: 'text-rose-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DRAW TAB ── */}
        {activeTab === 'draw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Draw Engine
              </h3>

              {/* Draw type */}
              <div className="space-y-2 mb-6">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Draw type</p>
                {[
                  { id: 'random',   label: 'Random draw', desc: 'Standard lottery-style random numbers' },
                  { id: 'weighted', label: 'Weighted draw', desc: 'Favours most frequent user scores' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      drawType === opt.id
                        ? 'border-brand-500/40 bg-brand-500/8'
                        : 'border-white/8 hover:border-white/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="drawType"
                      value={opt.id}
                      checked={drawType === opt.id}
                      onChange={() => setDrawType(opt.id)}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <div className="text-white text-sm font-semibold">{opt.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Simulation result */}
              <AnimatePresence>
                {drawNumbers && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-dark-700 rounded-xl p-4 mb-5 border border-amber-500/20"
                  >
                    <p className="text-xs text-amber-400/60 mb-3 font-semibold uppercase tracking-wider">
                      Simulation result
                    </p>
                    <div className="flex gap-2 mb-3">
                      {drawNumbers.map((n, i) => (
                        <motion.div
                          key={n}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, type: 'spring' }}
                          className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-black text-amber-300"
                        >
                          {n}
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs">
                      Review before publishing — this cannot be undone
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button
                  onClick={runSimulation}
                  disabled={simRunning}
                  className="btn-outline text-sm py-2.5 flex-1"
                >
                  <RefreshCw size={14} className={simRunning ? 'animate-spin' : ''} />
                  {simRunning ? 'Simulating...' : 'Run simulation'}
                </button>
                <button
                  onClick={publishDraw}
                  disabled={publishing || !drawNumbers}
                  className="btn-primary text-sm py-2.5 flex-1 disabled:opacity-40"
                >
                  <Zap size={14} />
                  {publishing ? 'Publishing...' : 'Publish draw'}
                </button>
              </div>
            </div>

            {/* Prize pool info */}
            <div className="card">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-400" /> This Month's Pool
              </h3>
              <div className="space-y-4">
                {[
                  { tier: 'Jackpot',    match: '5 numbers', pct: '40%', amount: Math.round(stats.pool * 0.40), color: 'text-amber-400',  border: 'border-amber-500/20',  bg: 'bg-amber-500/8' },
                  { tier: '2nd Prize',  match: '4 numbers', pct: '35%', amount: Math.round(stats.pool * 0.35), color: 'text-slate-300',  border: 'border-slate-500/20',  bg: 'bg-slate-500/8' },
                  { tier: '3rd Prize',  match: '3 numbers', pct: '25%', amount: Math.round(stats.pool * 0.25), color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/8' },
                ].map(({ tier, match, pct, amount, color, border, bg }) => (
                  <div key={tier} className={`flex justify-between items-center p-4 rounded-xl border ${border} ${bg}`}>
                    <div>
                      <div className={`font-bold text-sm ${color}`}>{tier}</div>
                      <div className="text-white/40 text-xs">{match} · {pct} of pool</div>
                    </div>
                    <div className={`text-xl font-black ${color}`}>
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-blue-400" /> All Users
              </h3>
              <span className="text-white/30 text-xs">{users.length} shown</span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Users size={36} className="mx-auto mb-3 opacity-20" />
                <p>No users yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u, i) => {
                  const sub = u.subscriptions?.[0]
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-white/6 hover:border-white/12 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                          {(u.full_name || u.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {u.full_name || 'No name'}
                          </div>
                          <div className="text-white/30 text-xs">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                          <div className="text-white/50 text-xs">
                            {sub ? `₹${sub.amount}/${sub.plan === 'yearly' ? 'yr' : 'mo'}` : 'No plan'}
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          sub?.status === 'active'
                            ? 'bg-brand-500/15 text-brand-400 border-brand-500/20'
                            : 'bg-white/5 text-white/30 border-white/10'
                        }`}>
                          {sub?.status || 'inactive'}
                        </span>
                        {u.is_admin && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">
                            Admin
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── WINNERS TAB ── */}
        {activeTab === 'winners' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-brand-400" /> Winner Verification
              </h3>
              <span className="text-white/30 text-xs">{winners.length} total</span>
            </div>

            {winners.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Trophy size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-white/40">No winners yet</p>
                <p className="text-xs mt-1">Winners appear here after a draw is published</p>
              </div>
            ) : (
              <div className="space-y-3">
                {winners.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl bg-dark-700 border border-white/6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {w.profiles?.full_name || w.profiles?.email || 'Unknown'}
                        </div>
                        <div className="text-white/40 text-xs mt-0.5">
                          {w.prize_tier} · ₹{w.prize_amount?.toLocaleString('en-IN')}
                          {w.draws?.draw_date && ` · ${new Date(w.draws.draw_date).toLocaleDateString('en-IN')}`}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1.5 rounded-full font-semibold border ${
                        w.status === 'verified' ? 'bg-brand-500/15 text-brand-400 border-brand-500/20' :
                        w.status === 'paid'     ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' :
                        w.status === 'rejected' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                        'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateWinnerStatus(w.id, 'verified')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-semibold border border-brand-500/20 transition-colors"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => updateWinnerStatus(w.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                        {w.status === 'verified' && (
                          <button
                            onClick={() => updateWinnerStatus(w.id, 'paid')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-colors"
                          >
                            <Zap size={12} /> Mark Paid
                          </button>
                        )}
                      </div>
                    )}
                    {w.status === 'verified' && (
                      <button
                        onClick={() => updateWinnerStatus(w.id, 'paid')}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-colors"
                      >
                        <Zap size={12} /> Mark as Paid
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── CHARITY TAB ── */}
        {activeTab === 'charity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <Heart size={16} className="text-rose-400" /> Charity Directory
            </h3>
            <div className="space-y-3">
              {charities.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-white/6 hover:border-white/12 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div>
                      <div className="text-white font-semibold text-sm">{c.name}</div>
                      <div className="text-white/30 text-xs">{c.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-white font-bold text-sm">
                        ₹{c.total_raised?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-white/30 text-xs">raised</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      c.is_active
                        ? 'bg-brand-500/15 text-brand-400 border-brand-500/20'
                        : 'bg-white/5 text-white/30 border-white/10'
                    }`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {c.is_featured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}