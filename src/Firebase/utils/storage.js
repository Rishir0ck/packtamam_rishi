// src/utils/storage.js
import Cookies from 'js-cookie';

// Firebase Auth Storage
export const setFirebaseAuth = (uid, idToken) => {
  try {
    console.log("💾 Storing Firebase auth data...");
    console.log(`  UID: ${uid}`);
    console.log(`  ID Token Length: ${idToken.length} characters`);
    
    localStorage.setItem('firebase_uid', uid);
    localStorage.setItem('firebase_id_token', idToken);
    
    console.log("✅ Firebase auth data stored successfully");
    return true;
  } catch (error) {
    console.error("❌ Error storing Firebase auth:", error);
    return false;
  }
};

export const getFirebaseAuth = () => {
  try {
    const uid = localStorage.getItem('firebase_uid');
    const idToken = localStorage.getItem('firebase_id_token');
    
    console.log("📥 Retrieved Firebase auth data:");
    console.log(`  UID: ${uid || 'Not found'}`);
    console.log(`  ID Token: ${idToken ? 'Present' : 'Not found'}`);
    
    return { uid, idToken };
  } catch (error) {
    console.error("❌ Error retrieving Firebase auth:", error);
    return { uid: null, idToken: null };
  }
};

export const clearFirebaseAuth = () => {
  try {
    console.log("🧹 Clearing Firebase auth data...");
    
    const hadUID = localStorage.getItem('firebase_uid');
    const hadToken = localStorage.getItem('firebase_id_token');
    
    localStorage.removeItem('firebase_uid');
    localStorage.removeItem('firebase_id_token');
    
    console.log("✅ Firebase auth data cleared:");
    console.log(`  UID removed: ${hadUID ? 'Yes' : 'Was not present'}`);
    console.log(`  Token removed: ${hadToken ? 'Yes' : 'Was not present'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error clearing Firebase auth:", error);
    return false;
  }
};

// Server Auth Storage (using cookies for security)
export const setServerAuth = (token) => {
  try {
    console.log("💾 Storing server auth token...");
    console.log(`  Token Length: ${token.length} characters`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    
    Cookies.set('admin_token', token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    console.log("✅ Server auth token stored successfully");
    
    // Verify storage
    const stored = Cookies.get('admin_token');
    console.log(`  Verification: ${stored ? 'Token stored correctly' : 'Storage failed'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error storing server auth token:", error);
    return false;
  }
};

export const getServerAuth = () => {
  try {
    const token = Cookies.get('admin_token');
    
    console.log("📥 Retrieved server auth token:");
    console.log(`  Token: ${token ? 'Present' : 'Not found'}`);
    if (token) {
      console.log(`  Token Length: ${token.length} characters`);
    }
    
    return token || null;
  } catch (error) {
    console.error("❌ Error retrieving server auth token:", error);
    return null;
  }
};

export const clearServerAuth = () => {
  try {
    console.log("🧹 Clearing server auth token...");
    
    const hadToken = Cookies.get('admin_token');
    Cookies.remove('admin_token');
    
    console.log(`✅ Server auth token cleared: ${hadToken ? 'Yes' : 'Was not present'}`);
    
    // Verify removal
    const stillExists = Cookies.get('admin_token');
    console.log(`  Verification: ${stillExists ? 'Removal failed' : 'Successfully removed'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error clearing server auth token:", error);
    return false;
  }
};

// Complete Auth Clear
export const clearAllAuth = () => {
  console.log("🧹 Starting complete auth data cleanup...");
  
  const firebaseCleared = clearFirebaseAuth();
  const serverCleared = clearServerAuth();
  
  const success = firebaseCleared && serverCleared;
  
  console.log("📊 Auth cleanup summary:");
  console.log(`  Firebase cleared: ${firebaseCleared ? 'Success' : 'Failed'}`);
  console.log(`  Server cleared: ${serverCleared ? 'Success' : 'Failed'}`);
  console.log(`  Overall success: ${success ? 'Yes' : 'No'}`);
  
  return success;
};