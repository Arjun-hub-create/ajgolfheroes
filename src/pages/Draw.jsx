import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Calendar, Clock, Zap, RefreshCw, Star, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { runRandomDraw, checkMatch, getPrizeTier } from '../lib/drawEngine'
import { useAuth } from '../hooks/useAuth'
import { useScores } from '../hooks/useScores'
import { format } from 'date-fns'

export default function Draw() {
  const { user }            = useAuth()
  const { scores }          = useScores()
  const [latestDraw,  setLatestDraw]  = useState(null)
  const [pastDraws,   setPastDraws]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [simNumbers,  setSimNumbers]  = useState(null)
  const [spinning,    setSpinning]    = useState(false)
  const [userMatch,   setUserMatch]   = useState(null)
  const [showPast,    setShowPast]    = useState(false)

  useEffect(() => { fetchDraws() }, [])

  useEffect(() => {
    if (latestDraw && scores.length > 0) {
      const userScoreValues = scores.map(s => s.score)
      const matchCount = checkMatch(userScoreValues, latestDraw.numbers)
      const tier = getPrizeTier(matchCount)
      setUserMatch({ count: matchCount, tier })
    }
  }, [latestDraw, scores])

  async function fetchDraws() {
    setLoading(true)
    const { data } = await supabase
      .from('draws')
      .select('*')
      .eq('published', true)
      .order('draw_date', { ascending: false })

    if (data?.length) {
      setLatestDraw(data[0])
      setPastDraws(data.slice(1))
    }
    setLoading(false)
  }

  function simulateDraw() {
    setSpinning(true)
    setSimNumbers(null)
    setTimeout(() => {
      setSimNumbers(runRandomDraw())
      setSpinning(false)
    }, 1200)
  }

  const displayNumbers = latestDraw?.numbers || simNumbers || [7, 14, 22, 31, 38]
  const prizePool      = latestDraw?.prize_pool || 1240000

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-6">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <span className="label-tag mb-4 inline-flex">
            <Trophy size={11} /> Monthly draw
          </span>
          <h1 className="text-5xl font-black text-white mt-4 mb-4">
            {latestDraw
              ? format(new Date(latestDraw.draw_date), 'MMMM yyyy')
              : 'March 2026'
            }{' '}
            <span className="gradient-text-warm">Draw</span>
          </h1>
          <p className="text-white/40 text-lg">
            Match your Stableford scores to win from the prize pool.
          </p>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Draw numbers card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card text-center mb-6 border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-dark-800"
            >
              {latestDraw ? (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  <p className="text-brand-400 text-xs font-bold uppercase tracking-widest">
                    Official draw · {format(new Date(latestDraw.draw_date), 'dd MMM yyyy')}
                  </p>
                </div>
              ) : (
                <p className="text-white/40 text-xs mb-4 font-medium uppercase tracking-widest">
                  {simNumbers ? 'Simulation result' : 'Sample numbers'}
                </p>
              )}

              {/* Numbers */}
              <div className="flex justify-center gap-3 mb-8">
                {displayNumbers.map((n, i) => (
                  <motion.div
                    key={`${n}-${i}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black ${
                      user && scores.map(s => s.score).includes(n)
                        ? 'bg-brand-500/30 border-2 border-brand-400 text-brand-300 shadow-lg shadow-brand-500/20'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {n}
                  </motion.div>
                ))}
              </div>

              {/* User match result */}
              <AnimatePresence>
                {user && userMatch && latestDraw && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mx-auto max-w-xs p-4 rounded-xl border mb-6 ${
                      userMatch.tier
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {userMatch.tier ? (
                      <>
                        <p className="text-brand-400 font-bold text-sm">
                          🎉 You matched {userMatch.count} numbers!
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          {userMatch.tier.label} — you're a winner!
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/50 font-semibold text-sm">
                          You matched {userMatch.count} number{userMatch.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          Need 3+ matches to win. Better luck next month!
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulate button (only if no official draw) */}
              {!latestDraw && (
                <button
                  onClick={simulateDraw}
                  disabled={spinning}
                  className="btn-outline text-sm py-2 px-5 mx-auto"
                >
                  <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} />
                  {spinning ? 'Drawing...' : 'Simulate draw'}
                </button>
              )}
            </motion.div>

            {/* Prize tiers */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  match: '5 numbers', tier: 'Jackpot',
                  pool:  `₹${Math.round(prizePool * 0.40).toLocaleString('en-IN')}`,
                  share: '40%',
                  color: 'border-amber-500/30 bg-amber-500/5',
                  text:  'text-amber-400',
                  rollover: latestDraw?.rollover > 0
                    ? `+ ₹${latestDraw.rollover.toLocaleString('en-IN')} rollover`
                    : null,
                },
                {
                  match: '4 numbers', tier: '2nd prize',
                  pool:  `₹${Math.round(prizePool * 0.35).toLocaleString('en-IN')}`,
                  share: '35%',
                  color: 'border-slate-500/20 bg-slate-500/5',
                  text:  'text-slate-300',
                  rollover: null,
                },
                {
                  match: '3 numbers', tier: '3rd prize',
                  pool:  `₹${Math.round(prizePool * 0.25).toLocaleString('en-IN')}`,
                  share: '25%',
                  color: 'border-orange-500/20 bg-orange-500/5',
                  text:  'text-orange-400',
                  rollover: null,
                },
              ].map(({ match, tier, pool, share, color, text, rollover }, i) => (
                <motion.div
                  key={match}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className={`card ${color} text-center`}
                >
                  <div className={`text-xs font-bold uppercase tracking-widest ${text} mb-2`}>
                    {tier}
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{pool}</div>
                  <div className="text-white/30 text-xs">{share} of pool · {match}</div>
                  {rollover && (
                    <div className="text-amber-400 text-xs mt-1.5 font-semibold">{rollover}</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Draw info bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="card mb-6"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <Calendar size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <div className="text-white/40 text-xs">Draw date</div>
                    <div className="text-white font-semibold text-sm">
                      {latestDraw
                        ? format(new Date(latestDraw.draw_date), 'dd MMMM yyyy')
                        : '31 March 2026'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Trophy size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white/40 text-xs">Total prize pool</div>
                    <div className="text-white font-semibold text-sm">
                      ₹{prizePool.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white/40 text-xs">Draw type</div>
                    <div className="text-white font-semibold text-sm capitalize">
                      {latestDraw?.draw_type || 'Random'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Not logged in nudge */}
            {!user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="card border-brand-500/20 bg-brand-500/5 text-center mb-6"
              >
                <Star size={24} className="text-brand-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Want to see if you won?</p>
                <p className="text-white/40 text-sm mb-4">
                  Sign in to check your scores against the draw numbers
                </p>
                <a href="/login" className="btn-primary text-sm py-2 px-6 inline-flex">
                  Sign in to check
                </a>
              </motion.div>
            )}

            {/* Past draws */}
            {pastDraws.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => setShowPast(!showPast)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/8 hover:border-white/15 bg-dark-800 transition-all mb-3"
                >
                  <span className="text-white/60 font-semibold text-sm flex items-center gap-2">
                    <Clock size={14} /> Past draws ({pastDraws.length})
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-white/30 transition-transform ${showPast ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showPast && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {pastDraws.map((draw, i) => (
                        <motion.div
                          key={draw.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="card"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-sm font-semibold">
                              {format(new Date(draw.draw_date), 'MMMM yyyy')}
                            </span>
                            <span className="text-white/30 text-xs">
                              ₹{draw.prize_pool?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {draw.numbers?.map((n, j) => (
                              <div
                                key={j}
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/50"
                              >
                                {n}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}