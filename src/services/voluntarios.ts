import pb from '@/lib/pocketbase/client'
import { supabase } from '@/lib/supabase/client'

export type VoluntarioStatus = 'ativo' | 'inativo'
export type VoluntarioRole = 'administrador' | 'voluntario'

export interface Voluntario {
  id: string
  matricula: string
  nome: string
  status: VoluntarioStatus
  role?: VoluntarioRole
  created: string
  updated: string
}

export interface VoluntarioFormData {
  nome: string
  status?: VoluntarioStatus
  role?: VoluntarioRole
}

export const getVoluntarios = async (): Promise<Voluntario[]> => {
  const list = await pb.collection('voluntarios').getFullList<Voluntario>({ sort: 'matricula' })

  try {
    const { data: profiles } = await supabase.from('profiles').select('id, nome, role')
    if (profiles && profiles.length > 0) {
      const profileById = new Map(profiles.map((p) => [p.id, p.role as VoluntarioRole]))
      const profileByName = new Map(
        profiles.map((p) => [String(p.nome || '').trim().toLowerCase(), p.role as VoluntarioRole]),
      )

      list.forEach((v) => {
        if (!v.role) {
          const byId = profileById.get(v.id)
          const byName = profileByName.get(String(v.nome || '').trim().toLowerCase())
          v.role = byId || byName || 'voluntario'
        }
      })
    }
  } catch {
    // If profiles query fails, fallback to existing role or 'voluntario'
  }

  list.forEach((v) => {
    if (!v.role) v.role = 'voluntario'
  })

  return [...list].sort((a, b) => {
    const na = parseInt(a.matricula, 10)
    const nb = parseInt(b.matricula, 10)
    const aNum = isNaN(na) ? Number.MAX_SAFE_INTEGER : na
    const bNum = isNaN(nb) ? Number.MAX_SAFE_INTEGER : nb
    return aNum - bNum
  })
}

export const getVoluntario = async (id: string): Promise<Voluntario> => {
  const v = await pb.collection('voluntarios').getOne<Voluntario>(id)
  if (!v.role) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .or(`id.eq.${id},nome.ilike.${v.nome}`)
        .maybeSingle()
      if (profile?.role) {
        v.role = profile.role as VoluntarioRole
      }
    } catch {
      // ignore
    }
    if (!v.role) v.role = 'voluntario'
  }
  return v
}

export const createVoluntario = async (data: VoluntarioFormData): Promise<Voluntario> => {
  const payload: any = {
    nome: data.nome,
    status: data.status || 'ativo',
    role: data.role || 'voluntario',
  }

  let created: Voluntario
  try {
    created = await pb.collection('voluntarios').create<Voluntario>(payload)
  } catch (err: any) {
    if (err?.message?.includes('role') || err?.code === 'PGRST204') {
      delete payload.role
      created = await pb.collection('voluntarios').create<Voluntario>(payload)
    } else {
      throw err
    }
  }

  created.role = data.role || 'voluntario'

  try {
    await supabase.from('profiles').upsert({
      id: created.id,
      nome: data.nome,
      role: data.role || 'voluntario',
      status: data.status || 'ativo',
    })
  } catch {
    // ignore
  }

  return created
}

export const updateVoluntario = async (
  id: string,
  data: Partial<VoluntarioFormData>,
): Promise<Voluntario> => {
  let updated: Voluntario
  try {
    updated = await pb.collection('voluntarios').update<Voluntario>(id, data)
  } catch (err: any) {
    if (data.role && (err?.message?.includes('role') || err?.code === 'PGRST204')) {
      const { role, ...withoutRole } = data
      updated = await pb.collection('voluntarios').update<Voluntario>(id, withoutRole)
    } else {
      throw err
    }
  }

  if (data.role) {
    updated.role = data.role
  }

  try {
    const profileUpdates: any = {}
    if (data.nome) profileUpdates.nome = data.nome
    if (data.role) profileUpdates.role = data.role
    if (data.status) profileUpdates.status = data.status

    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from('profiles').update(profileUpdates).eq('id', id)
      if (data.nome) {
        await supabase.from('profiles').update(profileUpdates).ilike('nome', data.nome)
      }
    }
  } catch {
    // ignore
  }

  return updated
}

export const deleteVoluntario = async (id: string): Promise<void> => {
  await pb.collection('voluntarios').delete(id)
}

export const getActiveVoluntarios = async (): Promise<Voluntario[]> => {
  return await pb.collection('voluntarios').getFullList<Voluntario>({
    filter: 'status = "ativo"',
    sort: 'nome',
  })
}
