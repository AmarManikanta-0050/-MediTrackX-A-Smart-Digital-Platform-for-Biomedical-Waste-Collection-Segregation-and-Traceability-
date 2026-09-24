/**
 * Utility functions to generate domain-specific IDs for MediTrackX
 */

export const generateWasteId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `MW-${year}-${randomDigits}`;
};

export const generateRequestId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `CR-${year}-${randomDigits}`;
};

export const generateBinId = (prefix = 'BIN') => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomNum}`;
};

export const generateHospitalId = () => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `HOSP-${randomNum}`;
};
