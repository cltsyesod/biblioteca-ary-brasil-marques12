import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useRealtime(
  table: string,
  callback: (payload: unknown) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return
    const channelName = `library:${table}:${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => callbackRef.current(payload))
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table, enabled])
}

export default useRealtime
