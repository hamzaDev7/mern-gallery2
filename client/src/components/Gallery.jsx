import { useState } from 'react';
import { Star, Trash2, Edit2 } from 'lucide-react';
import EditModal from './EditModal';

function Gallery({ images, searchActive, onFavorite, onDelete, onEdit, onOpenViewer }) {
  const [editingImage, setEditingImage] = useState(null);

  if (images.length === 0) {
    if (searchActive) {
      return (
        <div className="state-card" style={{maxWidth: '400px'}}>
          <div className="header-sup">No search results</div>
          <div className="empty-icon">⚲</div>
          <div className="empty-text">No photos found</div>
          <div className="empty-subtext">Try another search term or clear the filter.</div>
        </div>
      );
    } else {
      return (
        <div className="state-card" style={{maxWidth: '400px'}}>
          <div className="empty-icon">📁</div>
          <div className="empty-text">Your gallery is empty</div>
          <div className="empty-subtext">Upload a photo to get started.</div>
        </div>
      );
    }
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div key={img._id} className="card">
            <div className="card-img-wrapper" onClick={() => onOpenViewer(index)}>
              <span className="card-badge">JPG</span>
              <button 
                className={`card-fav-btn ${img.isFavorite ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onFavorite(img._id, img.isFavorite); }}
                title={img.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                ★
              </button>
              <img 
                src={`http://localhost:5000${img.imageUrl}`} 
                alt={img.title || 'Untitled'} 
                className="card-img"
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3 className="card-title">{img.title || 'Untitled'}</h3>
                <button className="card-edit" onClick={() => setEditingImage(img)}>Edit</button>
              </div>
              <p className="card-desc">{img.description || 'No description available.'}</p>
              
              {img.tags && img.tags.length > 0 && (
                <div className="card-tags">
                  {img.tags.map(tag => (
                    <span key={tag} className="card-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingImage && (
        <EditModal 
          image={editingImage} 
          onClose={() => setEditingImage(null)} 
          onEditSuccess={onEdit} 
        />
      )}
    </>
  );
}

export default Gallery;
