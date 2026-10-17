import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import Gallery from './components/Gallery';
import Viewer from './components/Viewer';

const API_URL = 'http://localhost:5000/api/images';

function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, Filter, Sort state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  
  // Nav State
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Viewer state
  const [viewerIndex, setViewerIndex] = useState(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTab === 'favorites') params.append('favorite', 'true');
      
      // If we are on 'recent' tab, we force sort to recent regardless of select box
      if (activeTab === 'recent') {
         params.append('sort', 'recent');
      } else if (sort) {
         params.append('sort', sort);
      }

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      setImages(response.data);
    } catch (err) {
      setError('Failed to fetch images. Server might be down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchImages();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, activeTab, sort]);

  const handleUploadSuccess = (newImage) => {
    // If it matches current filters, prepend or append. Easier to just fetch.
    setShowUploadForm(false);
    fetchImages();
  };

  const handleToggleFavorite = async (id, currentFavorite) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}/favorite`, { isFavorite: !currentFavorite });
      setImages(images.map(img => img._id === id ? res.data : img));
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setImages(images.filter(img => img._id !== id));
      if (viewerIndex !== null) {
        setViewerIndex(null); // Close viewer if open
      }
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const handleEditSuccess = (updatedImage) => {
    setImages(images.map(img => img._id === updatedImage._id ? updatedImage : img));
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">F</div>
          <div>
            <h2>Framebox</h2>
            <span>MERN Gallery</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Workspace</div>
          <a href="#" className={`nav-item ${activeTab === 'all' && !showUploadForm ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('all'); setSearch(''); setShowUploadForm(false); }}>
            <span style={{width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block'}}></span>
            All photos
            <span className="badge">{activeTab === 'all' ? images.length : ''}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'favorites' && !showUploadForm ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('favorites'); setSearch(''); setShowUploadForm(false); }}>
            <span style={{color: '#f59e0b'}}>★</span>
            Favorites
            <span className="badge">{activeTab === 'favorites' ? images.length : ''}</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'recent' && !showUploadForm ? 'active' : ''}`} onClick={(e) => {
            e.preventDefault();
            setActiveTab('recent');
            setSearch('');
            setShowUploadForm(false);
          }}>
            <span>↗</span>
            Recently added
          </a>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Storage</div>
          <a href="#" className={`nav-item ${showUploadForm ? 'active' : ''}`} onClick={(e) => {
            e.preventDefault();
            setShowUploadForm(true);
          }}>
            <span>⭘</span> Local uploads
          </a>
          <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
            <span>⚙</span> Settings
          </a>
        </div>

        <div className="extension-target">
          <h4>Extension target</h4>
          <p>Add metadata, discovery controls, favorites, and helpful UI states.</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="header">
          <div className="header-sup">Your Collection</div>
          <h1>{showUploadForm ? 'Upload Photo' : activeTab === 'favorites' ? 'Favorites' : activeTab === 'recent' ? 'Recently Added' : 'All photos'}</h1>
          <p>Keep your favorite moments organised in one place.</p>
        </div>

        <div className="top-bar">
          <div className="search-box">
            <span style={{marginRight: '8px', opacity: 0.5}}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by title, desc, or tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={showUploadForm}
            />
          </div>
          
          <button 
            className={`btn ${activeTab === 'favorites' ? 'primary' : ''}`}
            onClick={() => { setActiveTab(activeTab === 'favorites' ? 'all' : 'favorites'); setShowUploadForm(false); }}
          >
            ★ Favorites
          </button>
          
          <select className="btn" value={activeTab === 'recent' ? 'recent' : sort} onChange={(e) => setSort(e.target.value)} disabled={activeTab === 'recent' || showUploadForm}>
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button className={`btn ${showUploadForm ? 'primary' : 'primary'}`} onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? 'Cancel Upload' : 'Upload photo'}
          </button>
        </div>

        {showUploadForm && (
          <div id="upload-container">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        <div className="results-meta" style={{ display: showUploadForm ? 'none' : 'flex' }}>
          <div>
            {search ? 'Search results' : (activeTab === 'favorites' ? 'Favorites' : activeTab === 'recent' ? 'Recently Added' : 'All photos')} 
            <span style={{fontWeight: 'normal', opacity: 0.6, marginLeft: '8px'}}>· {images.length} photos</span>
          </div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            Saved to MongoDB
          </div>
        </div>

        {!showUploadForm && (
          <>
            {loading ? (
              <div className="state-card" style={{alignItems: 'flex-start', maxWidth: '300px'}}>
                <div className="header-sup">Initial Loading</div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line short"></div>
              </div>
            ) : error ? (
              <div className="state-card error" style={{maxWidth: '400px'}}>
                <div className="header-sup" style={{color: '#fc8181'}}>API Error</div>
                <p>{error}</p>
                <button className="btn" onClick={fetchImages}>⟳ Retry request</button>
              </div>
            ) : (
              <Gallery 
                images={images}
                searchActive={!!search || activeTab === 'favorites'}
                onFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onEdit={handleEditSuccess}
                onOpenViewer={(index) => setViewerIndex(index)}
              />
            )}

            {viewerIndex !== null && (
              <Viewer 
                images={images}
                currentIndex={viewerIndex}
                onClose={() => setViewerIndex(null)}
                onNavigate={(newIndex) => setViewerIndex(newIndex)}
                onFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
