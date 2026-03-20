import { motion } from 'framer-motion'
import { Heart, Search } from 'lucide-react'
import { useState } from 'react'

const charities = [
  { id: 1, name: 'Cancer Research India',  category: 'Health',   raised: '₹14,20,000', members: 420, desc: 'Pioneering research into the causes, prevention and treatment of cancer across India.', color: 'from-rose-500/10',   border: 'border-rose-500/20',   dot: 'bg-rose-400' },
  { id: 2, name: 'AJ Cancer Foundation',   category: 'Health',   raised: '₹11,80,000', members: 310, desc: 'Supporting cancer patients and families through treatment, care and awareness drives.', color: 'from-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  { id: 3, name: 'Arjun Heart Foundation', category: 'Health',   raised: '₹9,40,000',  members: 280, desc: 'Fighting heart disease and circulatory conditions that affect millions of Indians.', color: 'from-red-500/10',    border: 'border-red-500/20',    dot: 'bg-red-400' },
  { id: 4, name: 'Age India',              category: 'Elderly',  raised: '₹7,10,000',  members: 195, desc: 'Providing care, support and dignity to elderly citizens across India.', color: 'from-amber-500/10',  border: 'border-amber-500/20',  dot: 'bg-amber-400' },
  { id: 5, name: 'Mind India Foundation',  category: 'Mental Health', raised: '₹5,80,000', members: 160, desc: 'Mental health awareness, counselling and support for those in need across India.', color: 'from-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  { id: 6, name: 'Shelter India',          category: 'Housing',  raised: '₹4,20,000',  members: 120, desc: 'Fighting homelessness and providing safe housing solutions for underprivileged families.', color: 'from-teal-500/10', border: 'border-teal-500/20', dot: 'bg-teal-400' },
]

export default function Charities() {
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-rose-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="label-tag mb-4 inline-flex"><Heart size={11} /> Our charities</span>
          <h1 className="text-5xl font-black text-white mt-4 mb-4">
            Play golf. <span className="gradient-text">Fund change.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Every subscription contributes to Indian charities that matter. Choose yours.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative max-w-md mx-auto mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search charities..."
            className="input-field pl-10"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
              className={`card-hover bg-gradient-to-br ${c.color} to-dark-800 border ${
                selected === c.id ? c.border + ' shadow-lg' : 'border-white/8'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${c.dot} mt-1.5`} />
                <span className="text-xs text-white/30 font-medium border border-white/10 px-2 py-0.5 rounded-full">
                  {c.category}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{c.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">{c.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-white/6">
                <div>
                  <div className="text-white font-bold">{c.raised}</div>
                  <div className="text-white/30 text-xs">total raised</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{c.members}</div>
                  <div className="text-white/30 text-xs">supporters</div>
                </div>
              </div>
              {selected === c.id && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="btn-primary w-full mt-4 text-sm py-2.5"
                >
                  <Heart size={14} /> Choose this charity
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}