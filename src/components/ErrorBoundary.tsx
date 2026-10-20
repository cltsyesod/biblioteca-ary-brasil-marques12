import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
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
    console.error('ErrorBoundary capturou um erro não tratado:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {this.props.fallbackTitle || 'Ocorreu um problema ao exibir este conteúdo'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {this.props.fallbackMessage ||
                'Os dados recebidos continham um formato inesperado, mas o sistema protegeu sua navegação.'}
            </p>
            {this.state.error && (
              <div className="mt-3 p-3 bg-red-100/90 border border-red-300 rounded text-left text-xs font-mono text-red-900 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                <span className="font-bold">{this.state.error.name || 'Error'}: </span>
                {this.state.error.message || String(this.state.error)}
                {this.state.error.stack && (
                  <pre className="mt-1 text-[11px] opacity-75 font-mono overflow-x-auto">{this.state.error.stack}</pre>
                )}
              </div>
            )}
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Tentar novamente
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-[#1F5C8B] text-white hover:bg-[#174A73]"
            >
              Recarregar página
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
