import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR BOUNDARY] Erro capturado:', error);
    console.error('🚨 [ERROR BOUNDARY] Stack:', errorInfo.componentStack);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">
                Erro ao Carregar Página
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Ocorreu um erro ao renderizar este componente.
              </p>
              {this.state.error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-red-900 mb-2">Mensagem de Erro:</h3>
                  <p className="text-red-700 font-mono text-sm">{this.state.error.toString()}</p>
                </div>
              )}
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
              >
                Voltar ao Site
              </button>
            </div>

            {/* Debug Panel */}
            <div className="bg-black text-red-400 rounded-2xl shadow-xl p-6 font-mono text-xs">
              <h3 className="font-bold text-lg mb-4">🚨 Detalhes do Erro</h3>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {this.state.error && (
                  <div className="mb-4">
                    <div className="text-yellow-400 font-bold mb-2">Error:</div>
                    <div className="text-white whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </div>
                    {this.state.error.stack && (
                      <>
                        <div className="text-yellow-400 font-bold mb-2 mt-4">Stack Trace:</div>
                        <div className="text-white whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <div className="text-yellow-400 font-bold mb-2">Component Stack:</div>
                    <div className="text-white whitespace-pre-wrap text-xs">
                      {this.state.errorInfo.componentStack}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
