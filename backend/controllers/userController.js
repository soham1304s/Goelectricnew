import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'address', 'profileImage', 'dateOfBirth', 'gender'];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowed.includes(key)) updates[key] = req.body[key];
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { uploadFile } = await import('../utils/uploader.js');
    const uploadResult = await uploadFile(req.file, 'profiles');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: uploadResult.url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addresses = user.savedAddresses || [];
    res.status(200).json({ 
      success: true, 
      data: addresses 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { label, address, city, state, zipCode, type } = req.body;
    
    if (!address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Address and city are required',
      });
    }

    const user = await User.findById(req.user._id);
    user.savedAddresses.push({
      _id: new mongoose.Types.ObjectId(),
      label: label || type || 'Other',
      address,
      city,
      state,
      zipCode,
      type: type || 'other'
    });

    await user.save();
    res.status(201).json({ success: true, data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.savedAddresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    Object.assign(user.savedAddresses[addressIndex], req.body);
    await user.save();
    
    res.status(200).json({ success: true, data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.savedAddresses = user.savedAddresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();
    res.status(200).json({ success: true, data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    res.status(200).json({ success: true, data: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, data: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, data: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
