// RoutePointPopup - Nokta için puan ve yorum popup'ı
import { useState } from 'react';
import { useRouteStore } from '../../store';
import './RoutePointPopup.css';

interface POI {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  address: string;
  coordinates: [number, number];
}

interface RoutePointPopupProps {
  poi: POI;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onClose: () => void;
}

const RoutePointPopup = ({ poi, language, onClose }: RoutePointPopupProps) => {
  const { selectedPoints, updatePointRating, updatePointComment, removePoint } = useRouteStore();
  
  const point = selectedPoints.find(p => p.poiId === poi.id);
  const [localComment, setLocalComment] = useState(point?.comment || '');
  const [localRating, setLocalRating] = useState(point?.rating || 5);

  const translations = {
    tr: {
      happiness: 'Mutluluk Skoru',
      comment: 'Yorum (opsiyonel)',
      commentPlaceholder: 'Bu yer hakkında ne düşünüyorsunuz?',
      save: 'Kaydet',
      remove: 'Rotadan Çıkar',
      order: 'Sıra'
    },
    en: {
      happiness: 'Happiness Score',
      comment: 'Comment (optional)',
      commentPlaceholder: 'What do you think about this place?',
      save: 'Save',
      remove: 'Remove from Route',
      order: 'Order'
    },
    de: {
      happiness: 'Glücklichkeitswert',
      comment: 'Kommentar (optional)',
      commentPlaceholder: 'Was denken Sie über diesen Ort?',
      save: 'Speichern',
      remove: 'Aus Route entfernen',
      order: 'Reihenfolge'
    },
    fr: {
      happiness: 'Score de bonheur',
      comment: 'Commentaire (optionnel)',
      commentPlaceholder: 'Que pensez-vous de cet endroit?',
      save: 'Sauvegarder',
      remove: 'Retirer de l\'itinéraire',
      order: 'Ordre'
    },
    es: {
      happiness: 'Puntuación de felicidad',
      comment: 'Comentario (opcional)',
      commentPlaceholder: '¿Qué piensas de este lugar?',
      save: 'Guardar',
      remove: 'Eliminar de la ruta',
      order: 'Orden'
    },
    it: {
      happiness: 'Punteggio felicità',
      comment: 'Commento (opzionale)',
      commentPlaceholder: 'Cosa pensi di questo posto?',
      save: 'Salva',
      remove: 'Rimuovi dal percorso',
      order: 'Ordine'
    }
  };

  const t = translations[language];

  // Mutluluk emojileri
  const happinessEmojis = [
    { score: 1, emoji: '😢', label: 'Kötü' },
    { score: 2, emoji: '😕', label: 'Fena değil' },
    { score: 3, emoji: '😊', label: 'İyi' },
    { score: 4, emoji: '😄', label: 'Çok iyi' },
    { score: 5, emoji: '🤩', label: 'Harika!' }
  ];

  // Kaydet
  const handleSave = () => {
    updatePointRating(poi.id, localRating);
    updatePointComment(poi.id, localComment);
    onClose();
  };

  // Kaldır
  const handleRemove = () => {
    removePoint(poi.id);
    onClose();
  };

  if (!point) return null;

  return (
    <div className="route-point-popup-overlay" onClick={onClose}>
      <div className="route-point-popup" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="popup-header">
          <div className="popup-order">{point.order + 1}</div>
          <div className="popup-info">
            <h3>{poi.name}</h3>
            <p>{poi.subcategory}</p>
          </div>
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>

        {/* Mutluluk skoru */}
        <div className="popup-section">
          <label>{t.happiness}</label>
          <div className="happiness-selector">
            {happinessEmojis.map(({ score, emoji, label }) => (
              <button
                key={score}
                className={`happiness-btn ${localRating === score ? 'selected' : ''}`}
                onClick={() => setLocalRating(score)}
                title={label}
              >
                <span className="emoji">{emoji}</span>
                <span className="score">{score}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Yorum */}
        <div className="popup-section">
          <label>{t.comment}</label>
          <textarea
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            placeholder={t.commentPlaceholder}
            rows={3}
            maxLength={200}
          />
        </div>

        {/* Butonlar */}
        <div className="popup-actions">
          <button className="remove-btn" onClick={handleRemove}>
            🗑️ {t.remove}
          </button>
          <button className="save-btn" onClick={handleSave}>
            ✓ {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePointPopup;

