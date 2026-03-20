import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDraw() {
  const [latestDraw, setLatestDraw] = useState(null)
  const [allDraws,   setAllDraws]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { fetchDraws() }, [])

  async function fetchDraws() {
    setLoading(true)
    const { data } = await supabase
      .from('draws')
      .select('*')
      .eq('published', true)
      .order('draw_date', { ascending: false })
    if (data?.length) {
      setLatestDraw(data[0])
      setAllDraws(data)
    }
    setLoading(false)
  }

  return { latestDraw, allDraws, loading, refetch: fetchDraws }
}