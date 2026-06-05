import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, Upload, Search, X } from 'lucide-react';
import { PhotoGrid } from '../components/gallery/PhotoGrid';
import { PhotoDetail } from '../components/gallery/PhotoDetail';
import { FilterPanel } from '../components/filters/FilterPanel';
import { DropZone } from '../components/upload/DropZone';
import { FileQueue } from '../components/upload/FileQueue';
import { useUpload } from '../hooks/useUpload';
import { useAnalysisPoller } from '../hooks/useAnalysisStatus';
import { useFilterStore } from '../store/filterStore';
import { listPhotos, searchPhotos, deletePhoto, getTopTags, getPhoto } from '../api/photoApi';

export function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const { searchText, activeColors, activeTags, dateRange, setSearch } = useFilterStore();

  const isFiltered = searchText || activeColors.length > 0 || activeTags.length > 0 || dateRange.from || dateRange.to;

  // Load / search photos whenever filters change
  useEffect(() => {
    if (isFiltered) {
      searchPhotos({
        q: searchText,
        colors: activeColors.join(','),
        tags: activeTags.join(','),
        date_from: dateRange.from,
        date_to: dateRange.to,
      }).then((r) => setPhotos(r.photos));
    } else {
      listPhotos(100).then(setPhotos);
    }
  }, [searchText, activeColors, activeTags, dateRange, isFiltered]);

  useEffect(() => {
    getTopTags().then(setTopTags);
  }, []);

  // Poll analysis status for in-progress photos
  const handleStatusUpdate = useCallback((id, status) => {
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, analysis_status: status } : p));
    // Refresh full photo data once done so tags/colors appear
    if (status === 'done') {
      getPhoto(id).then((updated) =>
        setPhotos((prev) => prev.map((p) => p.id === id ? updated : p))
      );
      getTopTags().then(setTopTags);
    }
  }, []);
  useAnalysisPoller(photos, handleStatusUpdate);

  // Upload
  const handleNewPhoto = useCallback((result) => {
    listPhotos(100).then(setPhotos);
  }, []);
  const { queue, addFiles, clearDone } = useUpload(handleNewPhoto);

  async function handleDelete(id) {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  }

  function handlePhotoChange(updated) {
    setSelectedPhoto(updated);
    setPhotos((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  return (
    <div className="gallery-page">
      {/* Toolbar */}
      <header className="toolbar">
        <div className="toolbar__search">
          <Search size={16} className="toolbar__search-icon" />
          <input
            className="toolbar__search-input"
            placeholder="Search photos…"
            value={searchText}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchText && (
            <button className="btn-ghost icon-btn" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
        <button className={`btn-ghost icon-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters((v) => !v)} title="Filters">
          <SlidersHorizontal size={18} />
          {(activeColors.length > 0 || activeTags.length > 0) && (
            <span className="toolbar__filter-badge">{activeColors.length + activeTags.length}</span>
          )}
        </button>
        <button className="btn-primary" onClick={() => setShowUpload((v) => !v)}>
          <Upload size={15} /> Upload
        </button>
      </header>

      {/* Upload area */}
      {showUpload && (
        <div className="upload-section">
          <DropZone onFiles={addFiles} />
          <FileQueue queue={queue} />
          {queue.some((q) => q.status === 'done') && (
            <button className="btn-ghost" onClick={clearDone}>Clear completed</button>
          )}
        </div>
      )}

      <div className="gallery-layout">
        {/* Sidebar filters */}
        {showFilters && (
          <FilterPanel tags={topTags} onClose={() => setShowFilters(false)} />
        )}

        {/* Photo grid */}
        <main className="gallery-main">
          <PhotoGrid
            photos={photos}
            onSelect={setSelectedPhoto}
            onDelete={handleDelete}
          />
        </main>
      </div>

      {/* Photo detail modal */}
      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onChange={handlePhotoChange}
        />
      )}
    </div>
  );
}
