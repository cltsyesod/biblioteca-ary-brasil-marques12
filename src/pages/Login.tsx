import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Recuperação de senha
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)

  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/', { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.')
      setIsSubmitting(false)
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      const msg = error?.message || ''
      if (msg.includes('inativa')) {
        setErrorMessage(msg)
      } else if (
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('connection')
      ) {
        setErrorMessage(
          'Não foi possível conectar ao banco de dados Supabase. Verifique sua conexão com a internet.',
        )
      } else {
        setErrorMessage('E-mail ou senha incorretos. Tente novamente ou use a opção "Esqueci minha senha" abaixo.')
      }
      setIsSubmitting(false)
    } else {
      navigate('/')
    }
  }

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail.trim()) {
      toast.error('Informe seu e-mail cadastrado.')
      return
    }

    setRecoveryLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      })

      if (error) {
        toast.error(error.message || 'Erro ao enviar link de recuperação.')
      } else {
        setRecoverySuccess(true)
        toast.success('Link de recuperação enviado!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro inesperado.')
    } finally {
      setRecoveryLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200/80 shadow-md p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[#1F5C8B] text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Biblioteca do Centro Espírita
          </h1>
          <p className="text-gray-500 text-sm">Acesso ao Sistema de Gestão</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3 font-medium text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-bold text-gray-700">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-sm px-3.5 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#1F5C8B]/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700">
                Senha
              </Label>
              <button
                type="button"
                onClick={() => {
                  setRecoveryEmail(email)
                  setRecoverySuccess(false)
                  setRecoveryOpen(true)
                }}
                className="text-xs text-[#1F5C8B] hover:text-[#174A73] hover:underline font-semibold"
              >
                Esqueci minha senha
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 text-sm px-3.5 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#1F5C8B]/30"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#1F5C8B] hover:bg-[#174A73] text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Entrando...' : 'Entrar no Sistema'}</span>
          </Button>
        </form>

        <p className="text-center text-gray-400 text-xs border-t border-gray-100 pt-4">
          Este sistema é de uso interno dos voluntários e equipe.
        </p>
      </div>

      {/* Modal de Recuperação de Senha */}
      <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1F5C8B] flex items-center justify-center mb-1">
              <KeyRound className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Recuperar Senha
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Informe seu e-mail cadastrado. Enviaremos um link seguro para você definir uma nova senha.
            </DialogDescription>
          </DialogHeader>

          {recoverySuccess ? (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">E-mail de recuperação enviado!</p>
                  <p className="text-emerald-700 mt-1">
                    Verifique sua caixa de entrada (e a pasta de spam) de <strong>{recoveryEmail}</strong> e clique no link para criar sua nova senha.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setRecoveryOpen(false)}
                className="w-full h-10 bg-[#1F5C8B] text-white font-bold text-sm"
              >
                Concluir
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendRecovery} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-gray-700">E-mail Cadastrado</Label>
                <Input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="h-11 text-sm border-gray-200"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecoveryOpen(false)}
                  className="h-10 text-sm font-semibold border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="h-10 px-4 bg-[#1F5C8B] hover:bg-[#174A73] text-white font-bold text-sm shadow-xs flex items-center gap-1.5"
                >
                  <span>{recoveryLoading ? 'Enviando...' : 'Enviar Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

