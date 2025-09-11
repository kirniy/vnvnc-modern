import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { colors } from '../utils/colors'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: '#000000' }}
        >
          <div 
            className="max-w-md w-full p-8 radius backdrop-blur-2xl border border-white/10 text-center"
            style={{ 
              backgroundColor: colors.glass.darker,
              boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 100px ${colors.neon.red}11`
            }}
          >
            <h1 
              className="text-3xl font-display font-extrabold mb-4 lowercase"
              style={{ color: colors.neon.red }}
            >
              Упс! Что-то пошло не так
            </h1>
            
            <p className="text-white/70 mb-6">
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
            </p>

            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-white/50 cursor-pointer text-sm">
                  Техническая информация
                </summary>
                <pre className="mt-2 p-3 radius bg-black/50 text-white/40 text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReload}
              className="px-6 py-3 radius font-bold text-white transition-all duration-300 border-2"
              style={{ 
                backgroundColor: colors.neon.red,
                borderColor: colors.neon.red,
                boxShadow: `0 8px 30px ${colors.neon.red}66`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 12px 40px ${colors.neon.red}88`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 8px 30px ${colors.neon.red}66`
              }}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary