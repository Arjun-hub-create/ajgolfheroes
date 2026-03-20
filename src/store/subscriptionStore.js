import { create } from 'zustand'

export const useSubscriptionStore = create((set) => ({
  subscription:  null,
  plan:          null,
  status:        null,
  charityId:     null,
  charityPct:    10,

  setSubscription: (s)   => set({ subscription: s }),
  setPlan:         (p)   => set({ plan: p }),
  setStatus:       (s)   => set({ status: s }),
  setCharity:      (id)  => set({ charityId: id }),
  setCharityPct:   (pct) => set({ charityPct: pct }),
  clear: () => set({ subscription: null, plan: null, status: null, charityId: null, charityPct: 10 }),
}))