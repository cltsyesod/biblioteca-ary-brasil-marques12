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
    const channel = supabase
      .channel('library:' + table)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => callbackRef.current(payload))
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table, enabled])
}

export default useRealtime
