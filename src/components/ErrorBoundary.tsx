import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {this.props.fallbackTitle || 'Ocorreu um erro ao carregar esta seção'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {this.state.error?.message || 'Erro inesperado na renderização do componente.'}
              </p>
            </div>
            <Button
              onClick={this.handleReset}
              className="bg-[#1F5C8B] hover:bg-[#174A73] text-white font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar página
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
