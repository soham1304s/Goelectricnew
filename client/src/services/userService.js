import api from './api.js';

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}

export async function updateProfile(updates) {
  const { data } = await api.put('/users/profile', updates);
  return data;
}

export async function getSettings() {
  const { data } = await api.get('/users/settings');
  return data;
}

export async function updateSettings(settings) {
  const { data } = await api.put('/users/settings', settings);
  return data;
}

export async function changePassword(passwordData) {
  const { data } = await api.post('/users/change-password', passwordData);
  return data;
}

export async function getSavedAddresses() {
  const { data } = await api.get('/users/addresses');
  return data;
}

export async function addAddress(addressData) {
  const { data } = await api.post('/users/addresses', addressData);
  return data;
}

export async function updateAddress(addressId, addressData) {
  const { data } = await api.put(`/users/addresses/${addressId}`, addressData);
  return data;
}

export async function deleteAddress(addressId) {
  const { data } = await api.delete(`/users/addresses/${addressId}`);
  return data;
}

export async function updateNotificationSettings(notificationSettings) {
  const { data } = await api.put('/users/notification-settings', notificationSettings);
  return data;
}
