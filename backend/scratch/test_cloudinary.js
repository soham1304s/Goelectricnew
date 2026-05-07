import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import AFTER dotenv.config
const { getCloudinary, isCloudinaryConfigured } = await import('../config/cloudinary.js');

console.log('--- Cloudinary Config Test ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('Configured:', isCloudinaryConfigured());

if (isCloudinaryConfigured()) {
  try {
    const cloudinary = await getCloudinary();
    const config = cloudinary.config();
    console.log('Cloudinary Instance Config:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key
    });
    console.log('✅ Cloudinary is ready!');
  } catch (err) {
    console.error('❌ Cloudinary initialization failed:', err.message);
  }
} else {
  console.log('❌ Cloudinary is not configured.');
}
