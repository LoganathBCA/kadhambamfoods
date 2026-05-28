// src/services/cloudinaryService.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file directly to Cloudinary via unsigned upload preset.
 * @param {File} file - The file to upload
 * @param {string} folder - Optional Cloudinary folder
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = async (file, folder = 'kadhambam') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();
  return { secure_url: data.secure_url, public_id: data.public_id };
};

/**
 * Get a transformed Cloudinary URL (resize, quality optimize).
 */
export const getOptimizedUrl = (url, { width = 800, quality = 'auto' } = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace(
    '/upload/',
    `/upload/w_${width},q_${quality},f_auto/`
  );
};
