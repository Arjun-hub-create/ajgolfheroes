export function runRandomDraw() {
  const numbers = []
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n)
  }
  return numbers.sort((a, b) => a - b)
}

 
export function runWeightedDraw(allScores = []) {
  const freq = {}
  allScores.forEach(s => { freq[s] = (freq[s] || 0) + 1 })
  const pool = []
  for (let i = 1; i <= 45; i++) pool.push(...Array(freq[i] || 1).fill(i))
  const picked = []
  while (picked.length < 5) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!picked.includes(pool[idx])) picked.push(pool[idx])
  }
  return picked.sort((a, b) => a - b)
}


export function checkMatch(userScores = [], drawNumbers = []) {
  return userScores.filter(s => drawNumbers.includes(s)).length
}

 
export function getPrizeTier(matchCount) {
  const tiers = {
    5: { tier: 'jackpot', label: '5-Number Match 🏆', poolShare: 0.40, color: 'amber' },
    4: { tier: 'second',  label: '4-Number Match 🥈', poolShare: 0.35, color: 'slate' },
    3: { tier: 'third',   label: '3-Number Match 🥉', poolShare: 0.25, color: 'orange' },
  }
  return tiers[matchCount] || null
}