import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DDL-PN ErrorBoundary] Caught UI error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-red-200 shadow-sm my-4">
          <div className="max-w-lg w-full bg-white p-6 rounded-xl border border-red-300 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-slate-900 font-republic">
                {this.props.fallbackTitle || 'Incident Technique Détecté'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Le module a rencontré une erreur inattendue lors du rendu des données. Vos données locales et synchronisées sont sécurisées.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 text-red-300 p-3 rounded-lg text-left text-[11px] font-mono-ref overflow-x-auto max-h-32 border border-slate-700">
                <span className="font-bold text-white block mb-0.5">Détail technique :</span>
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="bg-[#006d2f] hover:bg-[#005a26] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger le module</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
