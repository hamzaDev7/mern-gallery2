import { useEffect } from 'react';
import { Star, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

function Viewer({ images, currentIndex, onClose, onNavigate, onFavorite, onDelete }) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images]);

  if (!currentImage) return null;

  const handlePrev = () => {
    if (images.length === 0) return;
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    if (images.length === 0) return;
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button 
        className="viewer-close"
        onClick={onClose}
        title="Close viewer"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <button 
          className="slider-btn prev"
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          title="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {images.length > 1 && (
        <button 
          className="slider-btn next"
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          title="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div className="viewer-content" onClick={e => e.stopPropagation()}>
        <img 
          src={`http://localhost:5000${currentImage.imageUrl}`} 
          alt={currentImage.title || 'Untitled image'} 
          className="viewer-image"
        />
        
        <div className="viewer-metadata">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{currentImage.title || 'Untitled image'}</h2>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>{currentImage.description}</p>
              
              {currentImage.tags && currentImage.tags.length > 0 && (
                <div className="card-tags">
                  {currentImage.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="viewer-actions">
              <button 
                className={`btn-icon favorite ${currentImage.isFavorite ? 'active' : ''}`}
                onClick={() => onFavorite(currentImage._id, currentImage.isFavorite)}
                title="Favorite"
              >
                <Star fill={currentImage.isFavorite ? 'currentColor' : 'none'} size={24} />
              </button>
              <button 
                className="btn-icon delete" 
                onClick={() => onDelete(currentImage._id)}
                title="Delete"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;
