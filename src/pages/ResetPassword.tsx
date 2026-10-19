import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se há sessão ativa vinda do link de recuperação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se não houver sessão ativa nem hash de recuperação, avisa
        const hash = window.location.hash
        if (!hash.includes('access_token')) {
          setErrorMessage('Link de recuperação expirado ou inválido. Solicite um novo link na tela de login.')
        }
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (password.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMessage(error.message || 'Erro ao atualizar a senha.')
      } else {
        setSuccess(true)
        toast.success('Senha atualizada com sucesso!')
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200/80 shadow-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#1F5C8B] text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Criar Nova Senha
          </h1>
          <p className="text-gray-500 text-sm">
            Defina uma nova senha de acesso ao sistema
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 font-medium text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <p className="font-bold text-base">Senha alterada com sucesso!</p>
            <p className="text-xs text-emerald-700">Redirecionando para o sistema...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 text-sm border-gray-200"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Digite a mesma senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 pl-10 text-sm border-gray-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1F5C8B] hover:bg-[#174A73] text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full text-xs text-gray-500 hover:text-gray-800"
            >
              Voltar para o Login
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
