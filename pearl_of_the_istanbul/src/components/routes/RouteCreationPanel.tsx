// RouteCreationPanel - Rota oluşturma paneli
import { useState, useRef } from 'react';
import { type User } from 'firebase/auth';
import { useAuthStore, useRouteStore, ROUTE_TAGS } from '../../store';
import './RouteCreationPanel.css';

interface RouteCreationPanelProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  user: User | null;
}

const RouteCreationPanel = ({ language, user }: RouteCreationPanelProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    selectedPoints,
    routeTitle,
    routeDescription,
    selectedTags,
    setRouteTitle,
    setRouteDescription,
    toggleTag,
    removePoint,
    updatePointComment,
    updatePointPhoto,
    reorderPoints,
    cancelCreatingRoute,
    saveRoute
  } = useRouteStore();

  const { signIn } = useAuthStore();

  // Fotoğraf seçme ve base64'e çevirme
  const handlePhotoSelect = (poiId: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError(language === 'tr' ? 'Fotoğraf 2MB\'dan küçük olmalı' : 'Photo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updatePointPhoto(poiId, base64);
    };
    reader.readAsDataURL(file);
  };

  const translations = {
    tr: {
      createRoute: 'Rota Oluştur',
      title: 'Rota Başlığı',
      titlePlaceholder: 'Örn: Üsküdar Sahil Turu',
      description: 'Açıklama (opsiyonel)',
      descriptionPlaceholder: 'Rotanız hakkında kısa bir açıklama...',
      tags: 'Etiketler',
      selectedPoints: 'Seçilen Noktalar',
      noPoints: 'Haritadan nokta seçin (max 8)',
      pointsInfo: 'nokta seçildi',
      cancel: 'İptal',
      save: 'Kaydet ve Paylaş',
      saving: 'Kaydediliyor...',
      minPoints: 'En az 2 nokta seçmelisiniz',
      titleRequired: 'Başlık gerekli',
      commentPlaceholder: 'Yorum ekle...'
    },
    en: {
      createRoute: 'Create Route',
      title: 'Route Title',
      titlePlaceholder: 'E.g.: Uskudar Coastal Tour',
      description: 'Description (optional)',
      descriptionPlaceholder: 'A brief description about your route...',
      tags: 'Tags',
      selectedPoints: 'Selected Points',
      noPoints: 'Select points from map (max 8)',
      pointsInfo: 'points selected',
      cancel: 'Cancel',
      save: 'Save & Share',
      saving: 'Saving...',
      minPoints: 'Select at least 2 points',
      titleRequired: 'Title is required',
      commentPlaceholder: 'Add a comment...'
    },
    de: {
      createRoute: 'Route erstellen',
      title: 'Routentitel',
      titlePlaceholder: 'Z.B.: Üsküdar Küstentour',
      description: 'Beschreibung (optional)',
      descriptionPlaceholder: 'Eine kurze Beschreibung...',
      tags: 'Tags',
      selectedPoints: 'Ausgewählte Punkte',
      noPoints: 'Punkte auf der Karte auswählen (max 8)',
      pointsInfo: 'Punkte ausgewählt',
      cancel: 'Abbrechen',
      save: 'Speichern & Teilen',
      saving: 'Speichern...',
      minPoints: 'Mindestens 2 Punkte auswählen',
      titleRequired: 'Titel erforderlich',
      commentPlaceholder: 'Kommentar hinzufügen...'
    },
    fr: {
      createRoute: 'Créer un itinéraire',
      title: 'Titre',
      titlePlaceholder: 'Ex: Tour côtier d\'Üsküdar',
      description: 'Description (optionnel)',
      descriptionPlaceholder: 'Une brève description...',
      tags: 'Tags',
      selectedPoints: 'Points sélectionnés',
      noPoints: 'Sélectionnez des points (max 8)',
      pointsInfo: 'points sélectionnés',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      saving: 'Sauvegarde...',
      minPoints: 'Sélectionnez au moins 2 points',
      titleRequired: 'Titre requis',
      commentPlaceholder: 'Ajouter un commentaire...'
    },
    es: {
      createRoute: 'Crear ruta',
      title: 'Título',
      titlePlaceholder: 'Ej: Tour costero de Üsküdar',
      description: 'Descripción (opcional)',
      descriptionPlaceholder: 'Una breve descripción...',
      tags: 'Etiquetas',
      selectedPoints: 'Puntos seleccionados',
      noPoints: 'Seleccione puntos del mapa (max 8)',
      pointsInfo: 'puntos seleccionados',
      cancel: 'Cancelar',
      save: 'Guardar y Compartir',
      saving: 'Guardando...',
      minPoints: 'Seleccione al menos 2 puntos',
      titleRequired: 'Título requerido',
      commentPlaceholder: 'Añadir comentario...'
    },
    it: {
      createRoute: 'Crea percorso',
      title: 'Titolo',
      titlePlaceholder: 'Es: Tour costiero di Üsküdar',
      description: 'Descrizione (opzionale)',
      descriptionPlaceholder: 'Una breve descrizione...',
      tags: 'Tag',
      selectedPoints: 'Punti selezionati',
      noPoints: 'Seleziona punti dalla mappa (max 8)',
      pointsInfo: 'punti selezionati',
      cancel: 'Annulla',
      save: 'Salva e Condividi',
      saving: 'Salvataggio...',
      minPoints: 'Seleziona almeno 2 punti',
      titleRequired: 'Titolo richiesto',
      commentPlaceholder: 'Aggiungi commento...'
    }
  };

  const t = translations[language];

  // Kaydet
  const handleSave = async () => {
    if (!user) {
      await signIn();
      return;
    }

    setError(null);

    if (selectedPoints.length < 2) {
      setError(t.minPoints);
      return;
    }

    if (!routeTitle.trim()) {
      setError(t.titleRequired);
      return;
    }

    setIsSaving(true);
    try {
      await saveRoute(user.uid, user.displayName || 'Anonim', user.photoURL || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  // Sürükle-bırak işlevi (basit versiyon)
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderPoints(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < selectedPoints.length - 1) {
      reorderPoints(index, index + 1);
    }
  };

  return (
    <div className="route-creation-panel">
      <div className="panel-header">
        <h3>✨ {t.createRoute}</h3>
        <button className="panel-close" onClick={cancelCreatingRoute}>✕</button>
      </div>

      <div className="panel-content">
        {/* Başlık */}
        <div className="form-group">
          <label>{t.title}</label>
          <input
            type="text"
            value={routeTitle}
            onChange={(e) => setRouteTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            maxLength={60}
          />
        </div>

        {/* Açıklama */}
        <div className="form-group">
          <label>{t.description}</label>
          <textarea
            value={routeDescription}
            onChange={(e) => setRouteDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={2}
            maxLength={200}
          />
        </div>

        {/* Etiketler */}
        <div className="form-group">
          <label>{t.tags}</label>
          <div className="tags-grid">
            {ROUTE_TAGS.map(tag => (
              <button
                key={tag.key}
                className={`tag-btn ${selectedTags.includes(tag.key) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag.key)}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seçilen noktalar */}
        <div className="form-group">
          <label>
            {t.selectedPoints}
            <span className="points-count">({selectedPoints.length}/8)</span>
          </label>

          {selectedPoints.length === 0 ? (
            <div className="no-points">{t.noPoints}</div>
          ) : (
            <div className="selected-points-list">
              {selectedPoints
                .sort((a, b) => a.order - b.order)
                .map((point, index) => (
                  <div key={point.poiId} className="selected-point">
                    <div className="point-header">
                      <span className="point-order">{index + 1}</span>
                      <span className="point-name">{point.poiName}</span>
                      <div className="point-rating">
                        {'😊'.repeat(point.rating)}
                      </div>
                    </div>

                    {/* Comment Area with Photo */}
                    <div className="point-comment-section">
                      <div className="point-comment-input">
                        <input
                          type="text"
                          placeholder={translations[language].commentPlaceholder || "Yorum ekle..."}
                          value={point.comment || ''}
                          onChange={(e) => updatePointComment(point.poiId, e.target.value)}
                          maxLength={100}
                        />
                        <button
                          type="button"
                          className="photo-add-btn"
                          onClick={() => fileInputRefs.current[point.poiId]?.click()}
                          title={language === 'tr' ? 'Fotoğraf ekle' : 'Add photo'}
                        >
                          📷
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => { fileInputRefs.current[point.poiId] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoSelect(point.poiId, file);
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                      
                      {/* Photo Preview */}
                      {point.commentPhoto && (
                        <div className="point-photo-preview">
                          <img src={point.commentPhoto} alt="Preview" />
                          <button 
                            className="photo-remove-btn"
                            onClick={() => updatePointPhoto(point.poiId, undefined)}
                            title={language === 'tr' ? 'Fotoğrafı kaldır' : 'Remove photo'}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="point-actions">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Yukarı"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedPoints.length - 1}
                        title="Aşağı"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removePoint(point.poiId)}
                        className="remove-btn"
                        title="Kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="error-message">⚠️ {error}</div>
        )}
      </div>

      {/* Alt butonlar */}
      <div className="panel-footer">
        <button className="cancel-btn" onClick={cancelCreatingRoute}>
          {t.cancel}
        </button>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={isSaving || selectedPoints.length < 2}
        >
          {isSaving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
};

export default RouteCreationPanel;

