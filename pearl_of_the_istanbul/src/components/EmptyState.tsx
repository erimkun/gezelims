import React from 'react';
import './EmptyState.css';

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

interface EmptyStateProps {
  type: 'no-results' | 'no-data' | 'error' | 'offline' | 'loading';
  language?: LanguageKey;
  title?: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const translations = {
  tr: {
    'no-results': {
      title: 'Sonuç Bulunamadı',
      message: 'Arama kriterlerinize uygun sonuç bulunamadı. Farklı bir arama deneyin.',
      icon: '🔍',
    },
    'no-data': {
      title: 'Veri Yok',
      message: 'Gösterilecek veri bulunmuyor.',
      icon: '📭',
    },
    'error': {
      title: 'Bir Hata Oluştu',
      message: 'Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
      icon: '⚠️',
    },
    'offline': {
      title: 'Çevrimdışısınız',
      message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
      icon: '📡',
    },
    'loading': {
      title: 'Yükleniyor',
      message: 'Veriler yükleniyor, lütfen bekleyin...',
      icon: '⏳',
    },
  },
  en: {
    'no-results': {
      title: 'No Results Found',
      message: 'No results match your search criteria. Try a different search.',
      icon: '🔍',
    },
    'no-data': {
      title: 'No Data',
      message: 'There is no data to display.',
      icon: '📭',
    },
    'error': {
      title: 'An Error Occurred',
      message: 'There was a problem loading data. Please try again.',
      icon: '⚠️',
    },
    'offline': {
      title: 'You\'re Offline',
      message: 'Check your internet connection and try again.',
      icon: '📡',
    },
    'loading': {
      title: 'Loading',
      message: 'Loading data, please wait...',
      icon: '⏳',
    },
  },
  de: {
    'no-results': {
      title: 'Keine Ergebnisse',
      message: 'Keine Ergebnisse für Ihre Suche. Versuchen Sie eine andere Suche.',
      icon: '🔍',
    },
    'no-data': {
      title: 'Keine Daten',
      message: 'Es gibt keine Daten zum Anzeigen.',
      icon: '📭',
    },
    'error': {
      title: 'Ein Fehler ist aufgetreten',
      message: 'Beim Laden der Daten ist ein Problem aufgetreten. Bitte versuchen Sie es erneut.',
      icon: '⚠️',
    },
    'offline': {
      title: 'Sie sind offline',
      message: 'Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      icon: '📡',
    },
    'loading': {
      title: 'Wird geladen',
      message: 'Daten werden geladen, bitte warten...',
      icon: '⏳',
    },
  },
  fr: {
    'no-results': {
      title: 'Aucun résultat',
      message: 'Aucun résultat ne correspond à votre recherche. Essayez une autre recherche.',
      icon: '🔍',
    },
    'no-data': {
      title: 'Pas de données',
      message: 'Il n\'y a pas de données à afficher.',
      icon: '📭',
    },
    'error': {
      title: 'Une erreur s\'est produite',
      message: 'Un problème est survenu lors du chargement des données. Veuillez réessayer.',
      icon: '⚠️',
    },
    'offline': {
      title: 'Vous êtes hors ligne',
      message: 'Vérifiez votre connexion Internet et réessayez.',
      icon: '📡',
    },
    'loading': {
      title: 'Chargement',
      message: 'Chargement des données, veuillez patienter...',
      icon: '⏳',
    },
  },
  es: {
    'no-results': {
      title: 'Sin resultados',
      message: 'No hay resultados para su búsqueda. Intente otra búsqueda.',
      icon: '🔍',
    },
    'no-data': {
      title: 'Sin datos',
      message: 'No hay datos para mostrar.',
      icon: '📭',
    },
    'error': {
      title: 'Ocurrió un error',
      message: 'Hubo un problema al cargar los datos. Por favor, inténtelo de nuevo.',
      icon: '⚠️',
    },
    'offline': {
      title: 'Estás sin conexión',
      message: 'Comprueba tu conexión a Internet e inténtalo de nuevo.',
      icon: '📡',
    },
    'loading': {
      title: 'Cargando',
      message: 'Cargando datos, por favor espere...',
      icon: '⏳',
    },
  },
  it: {
    'no-results': {
      title: 'Nessun risultato',
      message: 'Nessun risultato corrisponde alla tua ricerca. Prova una ricerca diversa.',
      icon: '🔍',
    },
    'no-data': {
      title: 'Nessun dato',
      message: 'Non ci sono dati da visualizzare.',
      icon: '📭',
    },
    'error': {
      title: 'Si è verificato un errore',
      message: 'Si è verificato un problema durante il caricamento dei dati. Riprova.',
      icon: '⚠️',
    },
    'offline': {
      title: 'Sei offline',
      message: 'Controlla la connessione Internet e riprova.',
      icon: '📡',
    },
    'loading': {
      title: 'Caricamento',
      message: 'Caricamento dati in corso, attendere...',
      icon: '⏳',
    },
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  language = 'tr',
  title,
  message,
  icon,
  action,
}) => {
  const t = translations[language][type];
  
  const displayTitle = title || t.title;
  const displayMessage = message || t.message;
  const displayIcon = icon || t.icon;

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">
        {displayIcon}
      </div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      <p className="empty-state-message">{displayMessage}</p>
      {action && (
        <button 
          className="empty-state-action"
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
