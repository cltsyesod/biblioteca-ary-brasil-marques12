import pb from '@/lib/pocketbase/client'
import type { Emprestimo } from '@/services/emprestimos'

export interface AuditMovement {
  id: string
  acao: string
  created: string
  volunteerName: string
  volunteerMatricula: string
  bookTitle: string
  bookNumeroCadastro: string
  leitorNome: string
  leitorNumeroCadastro: string
}

const ACAO_LABELS: Record<string, string> = {
  criacao: 'Criação',
  alteracao: 'Alteração',
  emprestimo: 'Empréstimo',
  devolucao: 'Devolução',
  renovacao: 'Renovação',
  mudanca_status: 'Mudança de Status',
}

export function getAcaoLabel(acao: string): string {
  if (acao === 'criacao') return 'Empréstimo'
  return ACAO_LABELS[acao] || acao
}

function makeMovementFromEmprestimo(emp: Emprestimo): AuditMovement {
  const resp = emp.expand?.responsavel_voluntario || emp.expand?.responsavel
  const respObj = Array.isArray(resp) ? resp[0] : resp
  const volName = respObj?.nome || respObj?.name || '—'
  const volMat = respObj?.matricula || '—'
  return {
    id: String(emp.id || Math.random()),
    acao: 'emprestimo',
    created: String(emp.created || emp.data_emprestimo || ''),
    volunteerName: typeof volName === 'string' ? volName : '—',
    volunteerMatricula: typeof volMat === 'string' || typeof volMat === 'number' ? String(volMat) : '—',
    bookTitle: typeof emp.expand?.livro?.titulo === 'string' ? emp.expand.livro.titulo : '—',
    bookNumeroCadastro: emp.expand?.livro?.numero_cadastro ? String(emp.expand.livro.numero_cadastro) : '—',
    leitorNome: '—',
    leitorNumeroCadastro: '—',
  }
}

function makeMovementFromAudit(audit: any, emp?: Emprestimo): AuditMovement {
  const empResp = emp?.expand?.responsavel_voluntario || emp?.expand?.responsavel
  const empRespObj = Array.isArray(empResp) ? empResp[0] : empResp
  const volName =
    audit?.expand?.voluntario?.nome ||
    audit?.expand?.usuario?.name ||
    empRespObj?.nome ||
    empRespObj?.name ||
    '—'
  const volMat =
    audit?.expand?.voluntario?.matricula ||
    audit?.expand?.usuario?.matricula ||
    empRespObj?.matricula ||
    '—'
  return {
    id: String(audit?.id || Math.random()),
    acao: audit?.acao === 'criacao' ? 'emprestimo' : String(audit?.acao || 'emprestimo'),
    created: String(audit?.created || ''),
    volunteerName: typeof volName === 'string' ? volName : '—',
    volunteerMatricula: typeof volMat === 'string' || typeof volMat === 'number' ? String(volMat) : '—',
    bookTitle: typeof emp?.expand?.livro?.titulo === 'string' ? emp.expand.livro.titulo : '—',
    bookNumeroCadastro: emp?.expand?.livro?.numero_cadastro ? String(emp.expand.livro.numero_cadastro) : '—',
    leitorNome: typeof emp?.expand?.leitor?.nome_completo === 'string' ? emp.expand.leitor.nome_completo : '—',
    leitorNumeroCadastro: emp?.expand?.leitor?.numero_cadastro ? String(emp.expand.leitor.numero_cadastro) : '—',
  }
}

export async function getMovementsFromEmprestimos(
  emprestimos: Emprestimo[],
): Promise<AuditMovement[]> {
  if (emprestimos.length === 0) return []
  const empMap = new Map(emprestimos.map((e) => [e.id, e]))
  const ids = Array.from(empMap.keys())
  const filterParts = ids.map((id) => `registro_id = "${id}"`)
  const chunkSize = 30
  const allAudits: any[] = []

  for (let i = 0; i < filterParts.length; i += chunkSize) {
    const chunk = filterParts.slice(i, i + chunkSize).join(' || ')
    try {
      const records = await pb.collection('auditoria').getFullList({
        filter: chunk,
        sort: '-created',
        expand: 'voluntario,usuario',
      })
      allAudits.push(...records)
    } catch {
      /* ignore */
    }
  }

  if (allAudits.length === 0) return emprestimos.map(makeMovementFromEmprestimo)
  allAudits.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')))
  return allAudits.map((audit) => {
    const emp = empMap.get(audit.registro_id)
    return makeMovementFromAudit(audit, emp)
  })
}
