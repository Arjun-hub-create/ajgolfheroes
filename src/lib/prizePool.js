export const PLANS = {
  monthly: { price: 10,  label: 'Monthly' },
  yearly:  { price: 96,  label: 'Yearly'  },
}

const PRIZE_POOL_CUT   = 0.60  // 60% of revenue → prize pool
const CHARITY_MIN_PCT  = 0.10  // 10% minimum → charity

export function calculatePrizePool(subscribers = []) {
  const revenue = subscribers.reduce((acc, sub) => {
    const monthlyEquiv = sub.plan === 'yearly' ? PLANS.yearly.price / 12 : PLANS.monthly.price
    return acc + monthlyEquiv
  }, 0)
  return revenue * PRIZE_POOL_CUT
}

export function splitPrizePool(totalPool, jackpotRollover = 0) {
  return {
    jackpot: parseFloat(((totalPool * 0.40) + jackpotRollover).toFixed(2)),
    second:  parseFloat((totalPool * 0.35).toFixed(2)),
    third:   parseFloat((totalPool * 0.25).toFixed(2)),
  }
}

export function calculateCharityAmount(subscriptionPrice, charityPct = 10) {
  const pct = Math.max(charityPct, CHARITY_MIN_PCT * 100)
  return parseFloat(((subscriptionPrice * pct) / 100).toFixed(2))
}