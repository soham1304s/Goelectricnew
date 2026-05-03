import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, '../../backend/uploads');

/**
 * Upload a file to Cloudinary or local storage as fallback
 * @param {Object} file - Express file object (from multer memoryStorage)
 * @param {string} folder - Target folder/category (e.g., 'packages', 'documents', 'profiles')
 * @returns {Promise<Object>} - Object containing url and filename/public_id
 */
export const uploadFile = async (file, folder = 'misc') => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided for upload');
  }

  // 1. Try Cloudinary first if configured
  if (isCloudinaryConfigured()) {
    try {
      const cloudinary = await getCloudinary();
      if (cloudinary) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: `goelectriq/${folder}`,
              resource_type: 'auto' // handles images, pdfs, etc.
            },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(file.buffer);
        });

        if (result?.secure_url) {
          console.log(`✅ Cloudinary upload successful: ${result.secure_url}`);
          return {
            url: result.secure_url,
            filename: result.public_id,
            method: 'cloudinary'
          };
        }
      }
    } catch (cloudErr) {
      console.warn(`⚠️ Cloudinary upload failed for ${folder}, falling back to local:`, cloudErr.message);
    }
  }

  // 2. Fallback to local storage
  const targetDir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const filepath = path.join(targetDir, filename);

  try {
    fs.writeFileSync(filepath, file.buffer);
    
    // Construct local URL
    // We use relative path from the uploads root so the server can serve it correctly
    const url = `/uploads/${folder}/${filename}`;
    
    console.log(`💾 Local upload successful: ${url}`);
    return {
      url,
      filename,
      method: 'local'
    };
  } catch (writeErr) {
    console.error('❌ Local write failed:', writeErr.message);
    throw new Error('Failed to upload file to both Cloudinary and local storage');
  }
};

export default { uploadFile };
