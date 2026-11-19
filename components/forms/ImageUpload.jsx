'use client';

import { useState } from 'react';
import { ImagePlus, X, UploadCloud } from 'lucide-react';

async function compressImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('That image could not be read.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Choose a valid image file.'));
    element.src = dataUrl;
  });
  const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function ImageUpload({ value, onChange }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file (JPG, PNG or WebP).'); return; }
    if (file.size > 12 * 1024 * 1024) { setError('Please choose an image smaller than 12 MB.'); return; }
    setBusy(true); setError('');
    try { onChange(await compressImage(file)); }
    catch (err) { setError(err.message || 'Unable to prepare this image.'); }
    finally { setBusy(false); }
  };
  return (
    <div>
      {value ? <div className="relative h-56 overflow-hidden rounded-2xl border border-line bg-canvas"><img src={value} alt="Preview of the item you are reporting" className="h-full w-full object-contain" /><button type="button" onClick={() => onChange('')} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-slate-950/70 text-white transition hover:bg-slate-950" aria-label="Remove image"><X size={17} /></button><span className="absolute bottom-3 left-3 rounded-full bg-slate-950/65 px-3 py-1 text-[10px] font-semibold text-white">Image preview · compressed for demo storage</span></div> : <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-5 py-7 text-center transition hover:border-royal hover:bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/35"><input type="file" accept="image/*" onChange={upload} className="sr-only" /><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-royal shadow-sm dark:bg-slate-900 dark:text-blue-300">{busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-royal" /> : <ImagePlus size={22} />}</span><span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-copy">{busy ? 'Preparing your image…' : 'Choose an item photo'} {!busy && <UploadCloud size={14} className="text-royal" />}</span><span className="mt-1 text-xs text-muted">Optional · JPG, PNG or WebP · max 12 MB</span></label>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
