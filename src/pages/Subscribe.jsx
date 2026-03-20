import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Heart, Zap, ArrowRight, Star, Lock, CreditCard, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const plans = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '₹800',
    amount: 800,
    period: '/month',
    saving: null,
    features: ['Full platform access', 'Monthly draw entry', 'Charity contribution', 'Score tracking', 'Winner verification'],
    highlight: false,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '₹7,680',
    amount: 7680,
    period: '/year',
    saving: 'Save ₹1,920 (20% off)',
    features: ['Everything in monthly', 'Priority support', 'Early draw results', 'Annual stats report', 'Exclusive yearly badge'],
    highlight: true,
  },
]

const charityOptions = [
  { id: null, name: 'Cancer Research India' },
  { id: null, name: 'AJ Cancer Foundation' },
  { id: null, name: 'Arjun Heart Foundation' },
  { id: null, name: 'Age India' },
]

// Steps
const STEP_PLAN    = 1
const STEP_CHARITY = 2
const STEP_PAYMENT = 3
const STEP_SUCCESS = 4

export default function Subscribe() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const [step,            setStep]            = useState(STEP_PLAN)
  const [selectedPlan,    setSelectedPlan]    = useState('yearly')
  const [selectedCharity, setSelectedCharity] = useState(0)
  const [charityPct,      setCharityPct]      = useState(10)
  const [charities,       setCharities]       = useState([])
  const [processing,      setProcessing]      = useState(false)

  // Card form state
  const [cardName,   setCardName]   = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv,    setCardCvv]    = useState('')

  // Load real charity IDs from Supabase when moving to charity step
  async function goToCharity() {
    const { data } = await supabase
      .from('charities')
      .select('id, name')
      .eq('is_active', true)
      .order('total_raised', { ascending: false })
    if (data) setCharities(data)
    setStep(STEP_CHARITY)
  }

  async function handlePayment(e) {
    e.preventDefault()

    if (!user) { toast.error('Please sign in first'); navigate('/login'); return }
    if (cardNumber.replace(/\s/g, '').length < 16) { toast.error('Enter a valid card number'); return }
    if (cardExpiry.length < 5) { toast.error('Enter a valid expiry date'); return }
    if (cardCvv.length < 3)    { toast.error('Enter a valid CVV'); return }
    if (!cardName.trim())      { toast.error('Enter cardholder name'); return }

    setProcessing(true)

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000))

    const plan        = plans.find(p => p.id === selectedPlan)
    const chosenCharity = charities[selectedCharity]

    // Create subscription in Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id:              user.id,
        plan:                 selectedPlan,
        status:               'active',
        charity_id:           chosenCharity?.id || null,
        charity_percentage:   charityPct,
        amount:               plan.amount,
        current_period_start: new Date().toISOString(),
        current_period_end:   new Date(
          Date.now() + (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    setProcessing(false)

    if (error) {
      toast.error('Something went wrong. Please try again.')
    } else {
      setStep(STEP_SUCCESS)
    }
  }

  // Format card number with spaces
  function formatCardNumber(val) {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  // Format expiry MM/YY
  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const plan          = plans.find(p => p.id === selectedPlan)
  const charityAmount = Math.round((plan.amount * charityPct) / 100)
  const displayCharity = charities[selectedCharity]?.name
    || charityOptions[selectedCharity]?.name
    || 'Cancer Research India'

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-6">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/6 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* Step SUCCESS */}
        <AnimatePresence mode="wait">
          {step === STEP_SUCCESS && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle size={44} className="text-brand-400" />
              </motion.div>
              <h1 className="text-4xl font-black text-white mb-4">You're in! 🎉</h1>
              <p className="text-white/50 text-lg mb-3">
                Welcome to AJGolfHeroes!
              </p>
              <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">
                Your <span className="text-white">{plan.label}</span> subscription is active.{' '}
                <span className="text-brand-400">₹{charityAmount}/month</span> will go to{' '}
                <span className="text-white">{displayCharity}</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary px-8 py-4"
                >
                  <Zap size={18} /> Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/draw')}
                  className="btn-outline px-8 py-4"
                >
                  View this month's draw
                </button>
              </div>
            </motion.div>
          )}

          {/* Steps 1–3 */}
          {step !== STEP_SUCCESS && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Header */}
              <div className="text-center mb-10">
                <span className="label-tag mb-4 inline-flex"><Heart size={11} /> Subscribe</span>
                <h1 className="text-4xl font-black text-white mt-4 mb-2">
                  {step === STEP_PLAN    && 'Choose your plan'}
                  {step === STEP_CHARITY && 'Choose your charity'}
                  {step === STEP_PAYMENT && 'Secure payment'}
                </h1>
                <p className="text-white/40">
                  {step === STEP_PLAN    && 'Simple pricing. Cancel anytime.'}
                  {step === STEP_CHARITY && 'Your subscription funds real change.'}
                  {step === STEP_PAYMENT && '256-bit encrypted · No data stored'}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[1,2,3].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > s
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : step === s
                        ? 'border-brand-500 text-brand-400'
                        : 'border-white/15 text-white/25'
                    }`}>
                      {step > s ? <Check size={13} /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${
                        step > s ? 'bg-brand-500' : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── STEP 1: PLAN ── */}
              {step === STEP_PLAN && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="grid md:grid-cols-2 gap-5 mb-8">
                    {plans.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`relative rounded-2xl p-7 border cursor-pointer transition-all duration-300 ${
                          selectedPlan === p.id
                            ? p.highlight
                              ? 'border-brand-500 bg-gradient-to-br from-brand-500/10 to-dark-800 shadow-xl shadow-brand-500/10'
                              : 'border-white/25 bg-dark-700'
                            : 'border-white/8 bg-dark-800 hover:border-white/15'
                        }`}
                      >
                        {p.highlight && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                              <Star size={10} /> Most popular
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{p.label}</div>
                            <div className="flex items-end gap-1">
                              <span className="text-4xl font-black text-white">{p.price}</span>
                              <span className="text-white/40 mb-1 text-sm">{p.period}</span>
                            </div>
                            {p.saving && (
                              <div className="text-brand-400 text-xs font-semibold mt-1">{p.saving}</div>
                            )}
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                            selectedPlan === p.id ? 'border-brand-500 bg-brand-500' : 'border-white/20'
                          }`}>
                            {selectedPlan === p.id && <Check size={13} className="text-white" />}
                          </div>
                        </div>
                        <ul className="space-y-2.5">
                          {p.features.map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                              <Check size={13} className="text-brand-400 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={goToCharity} className="btn-primary w-full py-4 text-base">
                    Continue <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: CHARITY ── */}
              {step === STEP_CHARITY && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="card mb-6">
                    <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                      <Heart size={16} className="text-rose-400" /> Select a charity
                    </h3>
                    <div className="space-y-3 mb-6">
                      {(charities.length > 0 ? charities : charityOptions).map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedCharity(i)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                            selectedCharity === i
                              ? 'border-brand-500 bg-brand-500/8 text-white'
                              : 'border-white/8 bg-dark-700 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedCharity === i ? 'border-brand-500 bg-brand-500' : 'border-white/20'
                            }`}>
                              {selectedCharity === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="font-medium text-sm">{c.name}</span>
                          </div>
                          {selectedCharity === i && (
                            <CheckCircle size={16} className="text-brand-400" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Contribution slider */}
                    <div className="pt-4 border-t border-white/8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/50 text-sm font-medium">Your contribution</span>
                        <span className="text-brand-400 font-black text-xl">{charityPct}%</span>
                      </div>
                      <input
                        type="range" min="10" max="50" step="1"
                        value={charityPct}
                        onChange={e => setCharityPct(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
                        style={{ accentColor: '#22c55e' }}
                      />
                      <div className="flex justify-between text-xs text-white/25 mb-4">
                        <span>10% min</span>
                        <span>50% max</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-500/8 border border-brand-500/20 flex justify-between items-center">
                        <span className="text-white/60 text-sm">Goes to charity monthly</span>
                        <span className="text-brand-400 font-black text-lg">₹{charityAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(STEP_PLAN)} className="btn-outline py-4 px-6">
                      Back
                    </button>
                    <button onClick={() => setStep(STEP_PAYMENT)} className="btn-primary flex-1 py-4">
                      Continue to payment <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: PAYMENT ── */}
              {step === STEP_PAYMENT && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

                  {/* Order summary */}
                  <div className="card mb-5 border-brand-500/15 bg-gradient-to-br from-brand-500/5 to-dark-800">
                    <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">Order summary</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Plan</span>
                        <span className="text-white font-semibold">{plan.label} · {plan.price}{plan.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Charity</span>
                        <span className="text-white font-semibold">{displayCharity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Charity contribution</span>
                        <span className="text-rose-400 font-semibold">₹{charityAmount} ({charityPct}%)</span>
                      </div>
                      <div className="pt-3 border-t border-white/8 flex justify-between">
                        <span className="text-white font-bold">Total today</span>
                        <span className="text-white font-black text-lg">{plan.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card form */}
                  <form onSubmit={handlePayment} className="card space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} className="text-brand-400" />
                      <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Secure card details
                      </span>
                      <div className="ml-auto flex gap-1.5">
                        {['VISA', 'MC', 'RuPay'].map(b => (
                          <span key={b} className="text-xs font-bold px-2 py-0.5 rounded bg-white/8 text-white/40 border border-white/10">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Arjun Sharma"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                        Card number
                      </label>
                      <div className="relative">
                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          className="input-field pl-10"
                          maxLength={19}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                          Expiry date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="input-field"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="•••"
                          className="input-field"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {processing ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing payment...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Pay {plan.price} securely
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-white/20 text-xs pt-1">
                      🔒 256-bit SSL encryption · Cancel anytime · No hidden charges
                    </p>
                  </form>

                  <button
                    onClick={() => setStep(STEP_CHARITY)}
                    className="btn-ghost w-full mt-3 text-sm"
                  >
                    ← Back
                  </button>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}