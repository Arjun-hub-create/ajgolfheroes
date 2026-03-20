import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Heart, Calendar, TrendingUp,
  Plus, Edit2, Trash2, Star, Clock,
  CheckCircle, X, Save
} from 'lucide-react'
import { useScores } from '../hooks/useScores'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 }
  })
}

export default function Dashboard() {
  const { user }    = useAuth()
  const { scores, loading, addScore, updateScore, deleteScore } = useScores()

  const [showAdd,   setShowAdd]   = useState(false)
  const [newScore,  setNewScore]  = useState('')
  const [newDate,   setNewDate]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editScore, setEditScore] = useState('')
  const [editDate,  setEditDate]  = useState('')
  const [profile,   setProfile]   = useState(null)
  const [subscription, setSubscription] = useState(null)

  // Fetch profile and subscription
  useEffect(() => {
    if (!user) return
    fetchProfile()
    fetchSubscription()
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  async function fetchSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, charities(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    setSubscription(data)
  }

  async function handleAddScore(e) {
    e.preventDefault()
    const val = parseInt(newScore)
    if (isNaN(val) || val < 1 || val > 45) {
      toast.error('Score must be between 1 and 45')
      return
    }
    if (!newDate) {
      toast.error('Please select a date')
      return
    }
    setSaving(true)
    const { error } = await addScore(val, newDate)
    if (error) toast.error(error.message)
    else {
      toast.success('Score added! 🏌️')
      setShowAdd(false)
      setNewScore('')
      setNewDate('')
    }
    setSaving(false)
  }

  async function handleUpdateScore(id) {
    const val = parseInt(editScore)
    if (isNaN(val) || val < 1 || val > 45) {
      toast.error('Score must be between 1 and 45')
      return
    }
    setSaving(true)
    const { error } = await updateScore(id, val, editDate)
    if (error) toast.error(error.message)
    else { toast.success('Score updated!'); setEditingId(null) }
    setSaving(false)
  }

  async function handleDeleteScore(id) {
    const { error } = await deleteScore(id)
    if (error) toast.error(error.message)
    else toast.success('Score removed')
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditScore(String(s.score))
    setEditDate(s.played_at)
  }

  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
    : 0

  const best = scores.length
    ? Math.max(...scores.map(s => s.score))
    : 0

  const displayName = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Golfer'

  const charityAmount = subscription
    ? ((subscription.amount * subscription.charity_percentage) / 100).toFixed(0)
    : 0

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-brand-400 text-sm font-semibold mb-1">Welcome back</p>
          <h1 className="text-4xl font-black text-white mb-2">
            {displayName} 👋
          </h1>
          <p className="text-white/40 text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Subscription',
              value: subscription ? 'Active' : 'Inactive',
              sub: subscription ? (subscription.plan === 'yearly' ? 'Yearly plan' : 'Monthly plan') : 'No plan',
              icon: Star,
              color: subscription ? 'text-brand-400' : 'text-white/30'
            },
            {
              label: 'Scores logged',
              value: `${scores.length}/5`,
              sub: 'Rolling 5 scores',
              icon: TrendingUp,
              color: 'text-blue-400'
            },
            {
              label: 'Average score',
              value: avg || '—',
              sub: 'Stableford pts',
              icon: Trophy,
              color: 'text-amber-400'
            },
            {
              label: 'Best score',
              value: best || '—',
              sub: 'Personal best',
              icon: Heart,
              color: 'text-rose-400'
            },
          ].map(({ label, value, sub, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="stat-card group"
            >
              <Icon size={18} className={`${color} mb-1`} />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/50 font-medium">{label}</div>
              <div className="text-xs text-white/25">{sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Scores panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Your Scores</h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    Last 5 rounds · newest first · max 45 pts
                  </p>
                </div>
                {!showAdd && (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    <Plus size={15} /> Add score
                  </button>
                )}
              </div>

              {/* Add score form */}
              <AnimatePresence>
                {showAdd && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddScore}
                    className="bg-dark-700 rounded-xl p-4 mb-5 border border-white/8 space-y-3 overflow-hidden"
                  >
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                      New score entry
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">
                          Stableford score (1–45)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="45"
                          value={newScore}
                          onChange={e => setNewScore(e.target.value)}
                          placeholder="e.g. 32"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">
                          Date played
                        </label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary py-2 px-4 text-sm flex-1"
                      >
                        {saving
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Save size={14} /> Save score</>
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAdd(false); setNewScore(''); setNewDate('') }}
                        className="btn-outline py-2 px-4 text-sm"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Scores list */}
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-dark-700 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-14 text-white/30">
                  <Trophy size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-semibold text-white/40">No scores yet</p>
                  <p className="text-xs mt-1">Add your first round to enter the monthly draw</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl bg-dark-700 border border-white/6 overflow-hidden"
                    >
                      {editingId === s.id ? (
                        // Edit mode
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              min="1"
                              max="45"
                              value={editScore}
                              onChange={e => setEditScore(e.target.value)}
                              className="input-field py-2 text-sm"
                            />
                            <input
                              type="date"
                              value={editDate}
                              onChange={e => setEditDate(e.target.value)}
                              className="input-field py-2 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateScore(s.id)}
                              disabled={saving}
                              className="btn-primary py-1.5 px-3 text-xs flex-1"
                            >
                              <Save size={12} /> Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn-outline py-1.5 px-3 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between p-4 group hover:border-brand-500/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                              {i + 1}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">
                                Round {scores.length - i}
                              </div>
                              <div className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                                <Calendar size={10} />
                                {format(new Date(s.played_at), 'dd MMM yyyy')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-black text-white">{s.score}</div>
                              <div className="text-xs text-white/30">pts</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(s)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteScore(s.id)}
                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Draw status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Draw Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Scores entered</span>
                  <span className="text-white font-semibold">{scores.length} / 5</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(scores.length / 5) * 100}%` }}
                    transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Draw eligible</span>
                  <span className={scores.length >= 3
                    ? 'text-brand-400 font-semibold flex items-center gap-1'
                    : 'text-white/30'
                  }>
                    {scores.length >= 3
                      ? <><CheckCircle size={12} /> Yes</>
                      : `Need ${3 - scores.length} more`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Next draw</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Clock size={12} className="text-white/40" />
                    End of month
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Subscription */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className={`card ${subscription
                ? 'border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-dark-800'
                : 'border-white/8'
              }`}
            >
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-brand-400" /> Subscription
              </h3>
              {subscription ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Status</span>
                    <span className="text-brand-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Plan</span>
                    <span className="text-white capitalize font-semibold">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Amount</span>
                    <span className="text-white font-semibold">₹{subscription.amount}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-white/40 text-xs mb-3">No active subscription</p>
                  <a href="/subscribe" className="btn-primary text-xs py-2 px-4">
                    Subscribe now
                  </a>
                </div>
              )}
            </motion.div>

            {/* Charity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card border-rose-500/15 bg-gradient-to-br from-rose-500/5 to-dark-800"
            >
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Heart size={16} className="text-rose-400" /> Your Charity
              </h3>
              {subscription?.charities ? (
                <div className="space-y-2 text-sm">
                  <p className="text-white font-semibold">{subscription.charities.name}</p>
                  <div className="flex justify-between">
                    <span className="text-white/50">Your contribution</span>
                    <span className="text-rose-400 font-bold">{subscription.charity_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Per month</span>
                    <span className="text-brand-400 font-bold">₹{charityAmount}</span>
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-xs">
                  Choose a charity when you subscribe
                </p>
              )}
            </motion.div>

            {/* Prize pool */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="card border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-dark-800"
            >
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-400" /> Prize Pool
              </h3>
              <div className="text-3xl font-black text-white mb-1">₹12,40,000</div>
              <div className="text-xs text-white/40 mb-3">This month's total</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Jackpot (5-match)</span>
                  <span className="text-amber-400 font-semibold">₹4,96,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">2nd tier (4-match)</span>
                  <span className="text-slate-300 font-semibold">₹4,34,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">3rd tier (3-match)</span>
                  <span className="text-orange-400 font-semibold">₹3,10,000</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}