import { useState, useRef } from 'react';
import axios from 'axios';

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      const res = await axios.post('http://localhost:5000/api/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onUploadSuccess(res.data);
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setTags('');
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h3 style={{marginBottom: '16px'}}>Upload New Photo</h3>
      {error && <div className="alert error">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div className="form-group">
          <label>Image File *</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef}
            disabled={uploading}
            required
            style={{background: 'var(--bg-input)'}}
          />
        </div>
        
        <div className="form-group">
          <label>Title * (max 80 chars)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            disabled={uploading}
            required
          />
        </div>

        <div className="form-group">
          <label>Description (max 240 chars)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={240}
            disabled={uploading}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Tags (comma separated, max 5)</label>
          <input 
            type="text" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="nature, travel, morning"
            disabled={uploading}
          />
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '8px'}}>
          <button type="submit" className="btn primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadForm;
