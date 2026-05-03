import { uploadFile } from '../utils/uploader.js';

/**
 * Upload package image (legacy route, now using centralized uploader)
 */
export const uploadPackageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadFile(req.file, 'packages');
    
    return res.status(200).json({ 
      success: true, 
      url: result.url, 
      filename: result.filename,
      method: result.method 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Upload failed',
    });
  }
};

/**
 * Generic upload controller for any entity
 */
export const uploadGenericImage = async (req, res) => {
  try {
    const { folder = 'misc' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadFile(req.file, folder);
    
    return res.status(200).json({ 
      success: true, 
      url: result.url, 
      filename: result.filename,
      method: result.method
    });
  } catch (error) {
    console.error('Generic upload error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Upload failed',
    });
  }
};
