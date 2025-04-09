import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_REACT_APP_SECRET_KEY; // Ensure this matches the backend key

// Encrypt Data
export const encryptData = (data) => {
  if (!SECRET_KEY) return "";

  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// Encrypt the SECRET_KEY itself for API headers
export const getEncryptedSecretKey = () => encryptData(SECRET_KEY);
