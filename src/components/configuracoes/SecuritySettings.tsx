import { useState } from 'react'
import { Lock, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export function SecuritySettings() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve possuir no mínimo 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da nova senha não coincide.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setErrorMessage(error.message || 'Erro ao alterar a senha.')
      } else {
        setSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Senha de acesso atualizada com sucesso!')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao atualizar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl bg-white border border-gray-200/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1F5C8B] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Segurança da Conta</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Altere sua senha de acesso ao sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2.5 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sua senha foi alterada com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-gray-700">Nova Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pl-10 text-sm border-gray-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-gray-700">Confirmar Nova Senha</Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-5 text-sm font-bold bg-[#1F5C8B] hover:bg-[#174A73] text-white shadow-xs"
            >
              {loading ? 'Salvando...' : 'Atualizar Senha'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
