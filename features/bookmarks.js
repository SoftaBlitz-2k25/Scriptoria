// Simple per-file bookmark storage using localStorage
// API: initForFile(fileKey), get(fileKey), isBookmarked(fileKey, page), toggle(fileKey, page)

// Sidecar-based storage using Electron preload API
// Stored per PDF file hash folder, file: bookmarks.json

const MEMORY = new Map(); // fileKey -> Set(pageNumbers)
async function loadFromSidecar(fileKey) {
  const data = await window.electronAPI?.readAnnotations?.(fileKey, 'bookmarks');
  const set = new Set(Array.isArray(data) ? data : []);
  MEMORY.set(fileKey, set);
}
async function saveToSidecar(fileKey) {
  const arr = Array.from(MEMORY.get(fileKey) || []);
  await window.electronAPI?.writeAnnotations?.(fileKey, 'bookmarks', arr);
}

export async function initForFile(fileKey) {
  if (!MEMORY.has(fileKey)) {
    await loadFromSidecar(fileKey);
  }
}

export function get(fileKey) {
  const set = MEMORY.get(fileKey) || new Set();
  return Array.from(set);
}

export function isBookmarked(fileKey, pageNumber) {
  const set = MEMORY.get(fileKey) || new Set();
  return set.has(pageNumber);
}

export async function add(fileKey, pageNumber) {
  const set = MEMORY.get(fileKey) || new Set();
  set.add(pageNumber);
  MEMORY.set(fileKey, set);
  await saveToSidecar(fileKey);
}

export async function remove(fileKey, pageNumber) {
  const set = MEMORY.get(fileKey) || new Set();
  set.delete(pageNumber);
  MEMORY.set(fileKey, set);
  await saveToSidecar(fileKey);
}

export async function toggle(fileKey, pageNumber) {
  if (isBookmarked(fileKey, pageNumber)) {
    await remove(fileKey, pageNumber);
    return false;
  }
  await add(fileKey, pageNumber);
  return true;
}


