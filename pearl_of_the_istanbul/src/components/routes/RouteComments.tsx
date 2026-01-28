// Route Comments - Rota yorumları bileşeni
import { useState, useEffect } from 'react';
import { useAuthStore, useRouteStore } from '../../store';
import './RouteComments.css';

interface RouteCommentsProps {
  routeId: string;
  isOpen: boolean;
  onClose: () => void;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const RouteComments = ({ routeId, isOpen, onClose, language }: RouteCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const { user, signIn } = useAuthStore();
  const { 
    comments, 
    isLoadingComments, 
    loadComments, 
    addRouteComment, 
    userDeleteComment 
  } = useRouteStore();

  const activeComments = comments[routeId] || [];

  useEffect(() => {
    if (isOpen && routeId) {
      loadComments(routeId);
    }
  }, [isOpen, routeId, loadComments]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await addRouteComment(
        routeId,
        user.uid,
        user.displayName || 'Gezgin',
        user.photoURL || undefined,
        newComment.trim()
      );
      setNewComment('');
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      alert('Yorum eklenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      try {
        await userDeleteComment(routeId, commentId);
      } catch (error) {
        console.error('Yorum silme hatası:', error);
      }
    }
  };

  const translations = {
    tr: {
      comments: 'Yorumlar',
      placeholder: 'Bir yorum yaz...',
      send: 'Gönder',
      loginToComment: 'Yorum yapmak için giriş yapmalısınız.',
      login: 'Giriş Yap',
      noComments: 'Henüz yorum yapılmamış. İlk yorumu sen yap!',
      delete: 'Sil'
    },
    en: {
      comments: 'Comments',
      placeholder: 'Write a comment...',
      send: 'Send',
      loginToComment: 'You must login to comment.',
      login: 'Login',
      noComments: 'No comments yet. Be the first to comment!',
      delete: 'Delete'
    },
    de: {
      comments: 'Kommentare',
      placeholder: 'Schreiben Sie einen Kommentar...',
      send: 'Senden',
      loginToComment: 'Sie müssen sich anmelden, um zu kommentieren.',
      login: 'Anmelden',
      noComments: 'Noch keine Kommentare. Seien Sie der Erste!',
      delete: 'Löschen'
    },
    fr: {
      comments: 'Commentaires',
      placeholder: 'Écrire un commentaire...',
      send: 'Envoyer',
      loginToComment: 'Vous devez vous connecter pour commenter.',
      login: 'Connexion',
      noComments: 'Pas encore de commentaires. Soyez le premier !',
      delete: 'Supprimer'
    },
    es: {
      comments: 'Comentarios',
      placeholder: 'Escribe un comentario...',
      send: 'Enviar',
      loginToComment: 'Debes iniciar sesión para comentar.',
      login: 'Iniciar sesión',
      noComments: '¡Aún no hay comentarios. Sé el primero!',
      delete: 'Eliminar'
    },
    it: {
      comments: 'Commenti',
      placeholder: 'Scrivi un commento...',
      send: 'Invia',
      loginToComment: 'Devi accedere per commentare.',
      login: 'Accedi',
      noComments: 'Nessun commento ancora. Sii il primo!',
      delete: 'Elimina'
    }
  };

  const t = translations[language];

  // Tarih formatlama
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="route-comments-overlay" onClick={onClose}>
      <div className="route-comments-modal" onClick={e => e.stopPropagation()}>
        <div className="comments-header">
          <h3>{t.comments} ({activeComments.length})</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="comments-list">
          {isLoadingComments ? (
            <div className="loading-spinner">Loading...</div>
          ) : activeComments.length === 0 ? (
            <div className="no-comments">{t.noComments}</div>
          ) : (
            activeComments.map(comment => (
              <div key={comment.id} className="comment-item">
                <img 
                  src={comment.userPhoto || 'https://via.placeholder.com/40'} 
                  alt={comment.userName} 
                  className="comment-avatar" 
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.userName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      {user && user.uid === comment.userId && (
                        <button 
                          onClick={() => handleDelete(comment.id!)} 
                          className="delete-comment-btn"
                        >
                          {t.delete}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="comments-footer">
          {user ? (
            <div className="comment-input-area">
              <textarea
                className="comment-textarea"
                placeholder={t.placeholder}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="comment-actions">
                <button 
                  className="submit-comment-btn" 
                  onClick={handleSubmit}
                  disabled={!newComment.trim()}
                >
                  {t.send}
                </button>
              </div>
            </div>
          ) : (
            <div className="login-prompt">
              {t.loginToComment} <button onClick={signIn} className="login-link">{t.login}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteComments;
