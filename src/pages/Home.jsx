import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Trophy, Zap, Shield, ArrowRight,
  ChevronRight, Star, Users, TrendingUp, Gift
} from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
}

function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const stats = [
  { icon: Users,      value: '2,400+', label: 'Active members' },
  { icon: Heart,      value: '₹48L',   label: 'Donated to charity' },
  { icon: Trophy,     value: '₹12L',   label: 'Prize pool this month' },
  { icon: TrendingUp, value: '94%',    label: 'Member satisfaction' },
]

const howItWorks = [
  {
    step: '01',
    icon: Shield,
    title: 'Subscribe & Choose',
    desc: 'Pick monthly or yearly. Select a charity you care about. A portion of every subscription goes directly to them.',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Enter Your Scores',
    desc: 'Log your last 5 Stableford scores after each round. Simple, fast, no faff. Your scores enter you into the monthly draw.',
    color: 'from-brand-500/20 to-brand-600/5',
    border: 'border-brand-500/20',
    iconColor: 'text-brand-400',
  },
  {
    step: '03',
    icon: Gift,
    title: 'Win Every Month',
    desc: 'Match 3, 4, or all 5 numbers in the monthly draw. Jackpots roll over. The more members, the bigger the pool.',
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
]

const charities = [
  { name: 'Cancer Research India',  raised: '₹14,20,000', color: 'bg-rose-500/10 border-rose-500/20',    dot: 'bg-rose-400' },
  { name: 'AJ Cancer Foundation',   raised: '₹11,80,000', color: 'bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-400' },
  { name: 'Arjun Heart Foundation', raised: '₹9,40,000',  color: 'bg-red-500/10 border-red-500/20',       dot: 'bg-red-400' },
  { name: 'Age India',              raised: '₹7,10,000',  color: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-500/6 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-900" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="label-tag">
              <Star size={11} /> Golf · Charity · Monthly Draws
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6"
          >
            Play golf.
            <br />
            <span className="gradient-text">Change lives.</span>
            <br />
            Win big.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            The subscription platform where every round you play supports a charity you love —
            and puts you in the draw for monthly cash prizes.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe" className="btn-primary text-base px-8 py-4 animate-glow-pulse">
              <Heart size={18} />
              Start giving from ₹800/month
              <ArrowRight size={16} />
            </Link>
            <Link to="/draw" className="btn-outline text-base px-8 py-4">
              <Trophy size={18} />
              See this month's draw
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-xs text-white/25">
            Cancel anytime · Razorpay-secured · 10% minimum to charity
          </motion.p>
        </motion.div>

        {/* Floating score card left */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:block animate-float"
        >
          <div className="glass p-4 w-48">
            <p className="text-xs text-white/40 mb-2 font-medium">Your scores</p>
            {[32, 28, 35, 31, 29].map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5">
                <span className="text-white/50">Round {5 - i}</span>
                <span className="text-brand-400 font-semibold">{s} pts</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating draw card right */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block animate-float"
          style={{ animationDelay: '2s' }}
        >
          <div className="glass p-4 w-52">
            <p className="text-xs text-white/40 mb-3 font-medium">This month's draw</p>
            <div className="flex gap-2 mb-3">
              {[7, 14, 22, 31, 38].map(n => (
                <div key={n} className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-xs font-bold text-brand-400">
                  {n}
                </div>
              ))}
            </div>
            <div className="text-xs text-white/30">Prize pool</div>
            <div className="text-xl font-black text-white">₹12,40,000</div>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <Section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div key={label} variants={fadeUp} className="stat-card group hover:border-brand-500/20 transition-colors duration-300">
              <Icon size={20} className="text-brand-400 mb-2" />
              <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-white/40 font-medium">{label}</div>
            </motion.div>
          ))}
        </Section>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-pad max-w-7xl mx-auto">
        <Section>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="label-tag mb-4 inline-flex">How it works</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
              Simple as a birdie.
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Three steps to play golf with purpose and win monthly prizes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map(({ step, icon: Icon, title, desc, color, border, iconColor }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className={`relative rounded-2xl p-8 bg-gradient-to-br ${color} border ${border} overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute top-6 right-6 text-6xl font-black text-white/4 select-none">
                  {step}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-white/5 border ${border} flex items-center justify-center mb-6`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* CHARITY IMPACT */}
      <section className="section-pad max-w-7xl mx-auto">
        <Section className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp}>
            <span className="label-tag mb-4 inline-flex">
              <Heart size={11} /> Charity impact
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-6 leading-tight">
              Your subscription <br />
              <span className="gradient-text">directly saves lives.</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-8">
              A minimum of 10% of every subscription goes straight to your chosen charity.
              You can increase your giving percentage any time. Every round played, every rupee tracked.
            </p>
            <Link to="/charities" className="btn-outline inline-flex">
              Browse charities <ChevronRight size={16} />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3">
            {charities.map(({ name, raised, color, dot }) => (
              <div key={name} className={`flex items-center justify-between p-4 rounded-xl border ${color} group hover:scale-[1.02] transition-transform duration-200`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-white/80 font-medium text-sm">{name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">{raised}</div>
                  <div className="text-white/30 text-xs">raised total</div>
                </div>
              </div>
            ))}
            <div className="card mt-4 flex justify-between items-center">
              <span className="text-white/50 text-sm">Total donated this year</span>
              <span className="text-2xl font-black gradient-text">₹48,20,000</span>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* PRIZE POOL */}
      <section className="section-pad max-w-7xl mx-auto">
        <Section>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex"><Trophy size={11} /> Prize draws</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4">
              Real money. Real draws.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5 numbers', prize: 'Jackpot (40%)', desc: 'Rolls over if unclaimed', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', glow: 'hover:border-amber-500/30' },
              { match: '4 numbers', prize: '35% of pool',   desc: 'Split between winners',   badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',  glow: 'hover:border-slate-500/30' },
              { match: '3 numbers', prize: '25% of pool',   desc: 'Split between winners',   badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', glow: 'hover:border-orange-500/30' },
            ].map(({ match, prize, desc, badge, glow }) => (
              <motion.div key={match} variants={fadeUp} className={`card ${glow} transition-colors duration-300 text-center`}>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 ${badge}`}>
                  {match}
                </div>
                <div className="text-2xl font-black text-white mb-1">{prize}</div>
                <div className="text-white/40 text-sm">{desc}</div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600/20 via-dark-700 to-dark-800 border border-brand-500/20 p-12 md:p-20 text-center animate-glow-pulse"
        >
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-brand-500/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to play <span className="gradient-text">with purpose?</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of Indian golfers making every round count — for charity, for prizes, for something bigger.
            </p>
            <Link to="/subscribe" className="btn-primary text-lg px-10 py-5">
              <Heart size={20} />
              Get started from ₹800/month
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/6 px-6 py-10 text-center text-white/25 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy size={14} className="text-brand-400" />
          <span className="font-bold text-white/40">AJGolfHeroes</span>
        </div>
        <p>© 2026 AJGolfHeroes · Powered by passion for golf and giving.</p>
      </footer>
    </div>
  )
}