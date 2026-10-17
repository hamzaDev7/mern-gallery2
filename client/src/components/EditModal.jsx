import { useState } from 'react';
import axios from 'axios';

function EditModal({ image, onClose, onEditSuccess }) {
  const [title, setTitle] = useState(image.title || '');
  const [description, setDescription] = useState(image.description || '');
  const [tags, setTags] = useState(image.tags ? image.tags.join(', ') : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await axios.patch(`http://localhost:5000/api/images/${image._id}`, {
        title,
        description,
        tags
      });
      onEditSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update metadata');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit image details</h3>
          <button className="modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-left">
              <img 
                src={`http://localhost:5000${image.imageUrl}`} 
                alt="Preview" 
                className="modal-image-preview" 
              />
              <div className="modal-image-title">{image.title || 'Untitled'}</div>
              <div className="modal-image-meta">JPG · Local upload</div>
            </div>

            <div className="modal-right">
              {error && <div className="alert error" style={{padding: '8px', marginBottom: '8px'}}>{error}</div>}
              
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  required
                  disabled={saving}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={240}
                  rows={4}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={saving}
                />
                <span className="hint">Use up to five short tags, separated by commas.</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
