import { useEffect, useState, useCallback, useMemo } from 'react'
import { GraduationCap, BookPlus, ChevronRight, ArrowUpDown, Calendar, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CursoForm } from '@/components/cursos/CursoForm'
import { CursoDetail } from '@/components/cursos/CursoDetail'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { getCursos, type Curso } from '@/services/cursos'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [detailCurso, setDetailCurso] = useState<Curso | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editCurso, setEditCurso] = useState<Curso | null>(null)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'cadastro' | 'ano' | 'nome'>('cadastro')

  const loadData = useCallback(async () => {
    try {
      const data = await getCursos()
      setCursos(data)
    } catch {
      toast.error('Erro ao carregar cursos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('cursos', () => {
    loadData()
  })

  const sortedCursos = useMemo(() => {
    const list = [...cursos]
    if (sortBy === 'nome') {
      return list.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'))
    }
    if (sortBy === 'ano') {
      return list.sort((a, b) =>
        String(a.ano_nivel_etapa || '').localeCompare(String(b.ano_nivel_etapa || ''), 'pt-BR', {
          numeric: true,
        }),
      )
    }
    // Ordem de cadastro (data de criação)
    return list.sort((a, b) => {
      const rawA = a.created || (a as any).created_at
      const rawB = b.created || (b as any).created_at
      const dateA = rawA ? new Date(rawA).getTime() : 0
      const dateB = rawB ? new Date(rawB).getTime() : 0
      if (dateA !== dateB) return dateA - dateB
      return String(a.id || '').localeCompare(String(b.id || ''))
    })
  }, [cursos, sortBy])

  const handleRowClick = (curso: Curso) => {
    setDetailCurso(curso)
    setDetailOpen(true)
  }

  const handleCreated = () => {
    loadData()
    toast.success('Curso cadastrado com sucesso!')
  }

  const handleEditSaved = () => {
    loadData()
    toast.success('Curso atualizado com sucesso!')
  }

  const handleEdit = (curso: Curso) => {
    setDetailOpen(false)
    setEditCurso(curso)
    setEditFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1F5C8B] flex items-center justify-center text-white shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cursos e Livros de Estudo</h2>
            <p className="text-base text-gray-500">
              Organize os cursos da casa e os livros utilizados em cada um
            </p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-12 px-5 text-base font-bold bg-[#1F5C8B] hover:bg-[#174A73] shadow-sm"
        >
          <BookPlus className="w-5 h-5 mr-2" />
          Novo curso
        </Button>
      </div>

      {/* Barra de Ordenação */}
      {cursos.length > 1 && (
        <div className="flex items-center gap-2 pt-1 pb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar por:
          </span>
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setSortBy('cadastro')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1',
                sortBy === 'cadastro'
                  ? 'bg-white text-[#1F5C8B] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Ordem de cadastro
            </button>
            <button
              type="button"
              onClick={() => setSortBy('ano')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1',
                sortBy === 'ano'
                  ? 'bg-white text-[#1F5C8B] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Ano / Etapa
            </button>
            <button
              type="button"
              onClick={() => setSortBy('nome')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1',
                sortBy === 'nome'
                  ? 'bg-white text-[#1F5C8B] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <SortAsc className="w-3.5 h-3.5" />
              Nome (A-Z)
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : sortedCursos.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">Nenhum curso cadastrado.</p>
          <p className="text-base text-gray-400 mt-1">
            Clique em "Novo curso" para cadastrar o primeiro curso.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-[1fr_1fr_60px] gap-4 px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <span>Nome do curso</span>
            <span>Ano, nível ou etapa</span>
            <span></span>
          </div>
          {sortedCursos.map((curso) => (
            <button
              key={curso.id}
              onClick={() => handleRowClick(curso)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#1F5C8B] hover:bg-[#1F5C8B]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F5C8B] md:grid md:grid-cols-[1fr_1fr_60px] md:items-center md:gap-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="md:hidden text-sm font-bold text-gray-500">Curso: </span>
                <span className="text-base font-bold text-gray-900">{curso.nome}</span>
              </div>
              <span className="text-base text-gray-700">{curso.ano_nivel_etapa || '—'}</span>
              <div className="hidden md:flex justify-end">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      <CursoForm open={formOpen} onOpenChange={setFormOpen} onSaved={handleCreated} />
      <CursoForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        onSaved={handleEditSaved}
        curso={editCurso}
      />
      <ErrorBoundary fallbackTitle="Não foi possível exibir os detalhes deste curso">
        <CursoDetail
          curso={detailCurso}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
        />
      </ErrorBoundary>
    </div>
  )
}
