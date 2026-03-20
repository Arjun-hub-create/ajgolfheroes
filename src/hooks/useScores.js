import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useScores() {
  const { user } = useAuthStore()
  const [scores,  setScores]  = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) fetchScores() }, [user])

  async function fetchScores() {
    setLoading(true)
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(5)
    if (!error) setScores(data || [])
    setLoading(false)
  }

  async function addScore(value, playedAt) {
    // Enforce rolling 5 — delete oldest if already at 5
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }
    const { error } = await supabase.from('scores').insert({
      user_id:   user.id,
      score:     value,
      played_at: playedAt,
    })
    if (!error) await fetchScores()
    return { error }
  }

  async function updateScore(id, value, playedAt) {
    const { error } = await supabase
      .from('scores')
      .update({ score: value, played_at: playedAt })
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) await fetchScores()
    return { error }
  }

  async function deleteScore(id) {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) await fetchScores()
    return { error }
  }

  return { scores, loading, addScore, updateScore, deleteScore, refetch: fetchScores }
}