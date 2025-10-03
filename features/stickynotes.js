// Sidecar-based storage for sticky notes per PDF
// Data shape example:
// [ { page: 2, x: 120, y: 200, text: 'Note here', color: '#ffeb3b' } ]

const MEMORY = new Map(); // fileKey -> Array of notes

export async function initForFile(fileKey) {
  const data = await window.electronAPI?.readAnnotations?.(fileKey, 'stickynotes');
  MEMORY.set(fileKey, Array.isArray(data) ? data : []);
}

export function getAll(fileKey) {
  return [...(MEMORY.get(fileKey) || [])];
}

export async function add(fileKey, note) {
  const arr = MEMORY.get(fileKey) || [];
  arr.push(note);
  MEMORY.set(fileKey, arr);
  await window.electronAPI?.writeAnnotations?.(fileKey, 'stickynotes', arr);
}

export async function replaceAll(fileKey, notes) {
  MEMORY.set(fileKey, Array.isArray(notes) ? notes : []);
  await window.electronAPI?.writeAnnotations?.(fileKey, 'stickynotes', MEMORY.get(fileKey));
}
