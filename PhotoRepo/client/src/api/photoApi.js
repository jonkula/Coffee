const BASE = '/api';

export async function uploadPhoto(file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('photo', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/photos/upload`);
    if (onProgress) {
      xhr.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total);
    }
    xhr.onload = () => {
      if (xhr.status === 201) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(JSON.parse(xhr.responseText)?.error || 'Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}

export async function listPhotos(limit = 50, offset = 0) {
  const r = await fetch(`${BASE}/photos?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error('Failed to fetch photos');
  return r.json();
}

export async function getPhoto(id) {
  const r = await fetch(`${BASE}/photos/${id}`);
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

export async function getPhotoStatus(id) {
  const r = await fetch(`${BASE}/photos/${id}/status`);
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

export async function deletePhoto(id) {
  const r = await fetch(`${BASE}/photos/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Delete failed');
  return r.json();
}

export async function addTag(photoId, name) {
  const r = await fetch(`${BASE}/photos/${photoId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error('Failed to add tag');
  return r.json();
}

export async function removeTag(photoId, tagId) {
  const r = await fetch(`${BASE}/photos/${photoId}/tags/${tagId}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to remove tag');
  return r.json();
}

export async function searchPhotos(params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== null && v !== '' && v !== undefined)
  ).toString();
  const r = await fetch(`${BASE}/search?${qs}`);
  if (!r.ok) throw new Error('Search failed');
  return r.json();
}

export async function getTopTags() {
  const r = await fetch(`${BASE}/search/tags`);
  if (!r.ok) throw new Error('Failed to load tags');
  return r.json();
}
