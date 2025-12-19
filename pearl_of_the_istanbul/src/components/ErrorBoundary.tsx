import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

interface Props {
  children: ReactNode;
  language?: LanguageKey;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const translations = {
  tr: {
    title: 'Bir şeyler yanlış gitti',
    subtitle: 'Beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin.',
    refresh: 'Sayfayı Yenile',
    details: 'Hata Detayları',
    hideDetails: 'Detayları Gizle',
    reportIssue: 'Sorunu Bildir',
  },
  en: {
    title: 'Something went wrong',
    subtitle: 'An unexpected error occurred. Please refresh the page.',
    refresh: 'Refresh Page',
    details: 'Error Details',
    hideDetails: 'Hide Details',
    reportIssue: 'Report Issue',
  },
  de: {
    title: 'Etwas ist schiefgelaufen',
    subtitle: 'Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.',
    refresh: 'Seite neu laden',
    details: 'Fehlerdetails',
    hideDetails: 'Details ausblenden',
    reportIssue: 'Problem melden',
  },
  fr: {
    title: 'Une erreur est survenue',
    subtitle: 'Une erreur inattendue s\'est produite. Veuillez rafraîchir la page.',
    refresh: 'Rafraîchir la page',
    details: 'Détails de l\'erreur',
    hideDetails: 'Masquer les détails',
    reportIssue: 'Signaler un problème',
  },
  es: {
    title: 'Algo salió mal',
    subtitle: 'Ocurrió un error inesperado. Por favor, actualice la página.',
    refresh: 'Actualizar página',
    details: 'Detalles del error',
    hideDetails: 'Ocultar detalles',
    reportIssue: 'Reportar problema',
  },
  it: {
    title: 'Qualcosa è andato storto',
    subtitle: 'Si è verificato un errore imprevisto. Aggiorna la pagina.',
    refresh: 'Aggiorna pagina',
    details: 'Dettagli errore',
    hideDetails: 'Nascondi dettagli',
    reportIssue: 'Segnala problema',
  },
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Burada hata izleme servisine (Sentry vb.) log gönderebilirsiniz
    // logErrorToService(error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, language = 'tr', fallback } = this.props;
    const t = translations[language];

    if (hasError) {
      // Custom fallback varsa onu göster
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          translations={t}
          onRefresh={this.handleRefresh}
        />
      );
    }

    return children;
  }
}

// Functional component for the error UI
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  translations: typeof translations.tr;
  onRefresh: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  translations: t,
  onRefresh,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="error-boundary-container" role="alert" aria-live="assertive">
      <div className="error-boundary-content">
        {/* Error Icon */}
        <div className="error-boundary-icon" aria-hidden="true">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="error-boundary-title">{t.title}</h1>
        <p className="error-boundary-subtitle">{t.subtitle}</p>

        {/* Actions */}
        <div className="error-boundary-actions">
          <button
            className="error-boundary-btn primary"
            onClick={onRefresh}
            aria-label={t.refresh}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {t.refresh}
          </button>

          <button
            className="error-boundary-btn secondary"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="error-details"
          >
            {showDetails ? t.hideDetails : t.details}
          </button>
        </div>

        {/* Error Details (collapsible) */}
        {showDetails && (
          <div id="error-details" className="error-boundary-details">
            <div className="error-details-section">
              <strong>Error:</strong>
              <pre>{error?.message || 'Unknown error'}</pre>
            </div>
            {error?.stack && (
              <div className="error-details-section">
                <strong>Stack Trace:</strong>
                <pre>{error.stack}</pre>
              </div>
            )}
            {errorInfo?.componentStack && (
              <div className="error-details-section">
                <strong>Component Stack:</strong>
                <pre>{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
