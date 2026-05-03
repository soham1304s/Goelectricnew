import express from 'express';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile, updateProfileImage, changePassword, getSavedAddresses, addAddress, updateAddress, deleteAddress, getSettings, updateSettings, updateNotificationSettings } from '../controllers/userController.js';
import { uploadImageMemory } from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', uploadImageMemory.single('image'), updateProfileImage);
router.post('/change-password', changePassword);

// Address routes
router.get('/addresses', getSavedAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.put('/notification-settings', updateNotificationSettings);

export default router;