// Firebase configuration with fallbacks
import { initializeApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut,
  type User,
  type Auth
} from "firebase/auth"; 
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  type Firestore 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  type FirebaseStorage 
} from "firebase/storage";

import type { UserProfile } from "../types";
import { StorageService } from "./storageService";

// Fallback Firebase config (public - safe to expose)
const firebaseConfig = {
  apiKey: "AIzaSyALgvrih8jpu7qrJ1VVhsJFcv_ehLdKTtI",
  authDomain: "roza-news.firebaseapp.com",
  projectId: "roza-news",
  storageBucket: "roza-news.appspot.com",
  messagingSenderId: "139138582160",
  appId: "1:139138582160:web:429592856867f42aacba15",
  measurementId: "G-WR3KVDQN96"
};

// Firebase instances with null checks
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Safe initialization
export const initializeFirebase = (): boolean => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log("✅ Firebase initialized successfully");
    }
    return true;
  } catch (error) {
    console.warn("⚠️ Firebase initialization failed, using fallback mode:", error);
    return false;
  }
};

// Initialize immediately
initializeFirebase();

// Safe getters
const getAuthSafe = (): Auth => {
  if (!auth) initializeFirebase();
  if (!auth) throw new Error("Firebase Auth not available");
  return auth;
};

const getFirestoreSafe = (): Firestore | null => {
  if (!db) initializeFirebase();
  return db;
};

const getStorageSafe = (): FirebaseStorage | null => {
  if (!storage) initializeFirebase();
  return storage;
};

const googleProvider = new GoogleAuthProvider();

// Default avatar generator
const DEFAULT_USER_AVATAR = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E11D48&color=fff&bold=true&size=256`;

// Admin emails
const ADMIN_EMAILS = ['rozanewsofficial@gmail.com', 'saifujafar895@gmail.com'];

export const AuthService = {
  // Check if Firebase is available
  isAvailable: () => !!auth,

  // Get instances
  getAuthInstance: () => auth,
  getFirestoreInstance: () => db,
  getStorageInstance: () => storage,

  // Google Sign In
  signInWithGoogle: async (): Promise<UserProfile> => {
    try {
      const authInstance = getAuthSafe();
      const result = await signInWithPopup(authInstance, googleProvider);
      const userProfile = AuthService.mapFirebaseUserToProfile(result.user);
      
      // Save locally
      StorageService.externalLogin(userProfile);
      
      // Try to save to Firestore (optional)
      try {
        await AuthService.saveUserToFirestore(userProfile);
      } catch (firestoreError) {
        console.warn("Firestore save failed, using local storage:", firestoreError);
      }
      
      return userProfile;
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      
      // User-friendly error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in cancelled by user");
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error("Network error. Please check your internet connection");
      }
      
      throw new Error(error.message || "Google sign-in failed");
    }
  },

  // Email Registration
  registerWithEmail: async (name: string, email: string, password: string): Promise<UserProfile> => {
    try {
      const authInstance = getAuthSafe();
      
      // Basic validation
      if (!name.trim()) throw new Error("Name is required");
      if (!email.trim()) throw new Error("Email is required");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      
      const result = await createUserWithEmailAndPassword(authInstance, email, password);
      
      // Update profile
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name.trim(),
          photoURL: DEFAULT_USER_AVATAR(name)
        });
      }
      
      const userProfile = AuthService.mapFirebaseUserToProfile(result.user);
      
      // Save locally
      StorageService.externalLogin(userProfile);
      
      // Try Firestore
      try {
        await AuthService.saveUserToFirestore(userProfile);
      } catch (e) {
        console.warn("Firestore save skipped:", e);
      }
      
      return userProfile;
    } catch (error: any) {
      console.error("Registration Error:", error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error("Email already registered. Please sign in.");
        case 'auth/invalid-email':
          throw new Error("Invalid email format.");
        case 'auth/weak-password':
          throw new Error("Password is too weak.");
        default:
          throw new Error(error.message || "Registration failed");
      }
    }
  },

  // Email Login
  loginWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    try {
      const authInstance = getAuthSafe();
      const result = await signInWithEmailAndPassword(authInstance, email, password);
      const userProfile = AuthService.mapFirebaseUserToProfile(result.user);
      
      // Save locally
      StorageService.externalLogin(userProfile);
      
      return userProfile;
    } catch (error: any) {
      console.error("Login Error:", error);
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error("Invalid email or password");
        case 'auth/user-disabled':
          throw new Error("Account disabled");
        case 'auth/too-many-requests':
          throw new Error("Too many attempts. Try again later");
        default:
          throw new Error(error.message || "Login failed");
      }
    }
  },

  // Phone Authentication
  setupRecaptcha: (elementId: string): RecaptchaVerifier | null => {
    try {
      const authInstance = getAuthSafe();
      const container = document.getElementById(elementId);
      if (!container) {
        console.error(`Element #${elementId} not found`);
        return null;
      }
      
      // Clear existing
      container.innerHTML = '';
      
      const verifier = new RecaptchaVerifier(authInstance, container, {
        size: 'normal',
        callback: () => console.log("reCAPTCHA solved"),
        'expired-callback': () => console.log("reCAPTCHA expired")
      });
      
      return verifier;
    } catch (error) {
      console.error("reCAPTCHA setup failed:", error);
      return null;
    }
  },

  signInWithPhone: async (phoneNumber: string, verifier: RecaptchaVerifier): Promise<any> => {
    try {
      const authInstance = getAuthSafe();
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      return await signInWithPhoneNumber(authInstance, formattedPhone, verifier);
    } catch (error: any) {
      console.error("Phone auth error:", error);
      throw new Error(error.message || "Phone authentication failed");
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth);
      }
      StorageService.logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if Firebase logout fails
      StorageService.logoutUser();
    }
  },

  // Map Firebase User to Profile
  mapFirebaseUserToProfile: (firebaseUser: User): UserProfile => {
    const userId = firebaseUser.uid;
    const userEmail = firebaseUser.email || "";
    const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase().trim());
    const role = isAdmin ? 'admin' : 'user';
    
    // Get avatar
    let avatar = firebaseUser.photoURL || DEFAULT_USER_AVATAR(firebaseUser.displayName || "User");
    
    // Get display name
    let displayName = firebaseUser.displayName?.trim() || "";
    if (!displayName && firebaseUser.phoneNumber) {
      displayName = `User ${firebaseUser.phoneNumber.slice(-4)}`;
    }
    if (!displayName && userEmail) {
      displayName = userEmail.split('@')[0];
    }
    if (!displayName) {
      displayName = "Roza User";
    }
    
    return {
      id: userId,
      name: displayName,
      email: userEmail,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      avatar: avatar,
      joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      role: role,
      notificationsEnabled: false,
      isPremium: false
    };
  },

  // Firestore Operations (Optional - won't break app if fails)
  saveUserToFirestore: async (userProfile: UserProfile): Promise<void> => {
    const dbInstance = getFirestoreSafe();
    if (!dbInstance) return;
    
    try {
      const userRef = doc(dbInstance, 'users', userProfile.id);
      await setDoc(userRef, {
        ...userProfile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.warn("Firestore save failed (non-critical):", error);
    }
  },

  getUserFromFirestore: async (userId: string): Promise<UserProfile | null> => {
    const dbInstance = getFirestoreSafe();
    if (!dbInstance) return null;
    
    try {
      const userRef = doc(dbInstance, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
    } catch (error) {
      console.warn("Firestore read failed:", error);
      return null;
    }
  }
};

export const MediaService = {
  // Upload file with multiple fallbacks
  uploadFile: async (file: File, folder: string = 'uploads'): Promise<string> => {
    if (!file) throw new Error("No file provided");
    
    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File too large. Max size: ${MAX_SIZE / (1024 * 1024)}MB`);
    }
    
    // Try Firebase Storage first
    const storageInstance = getStorageSafe();
    if (storageInstance) {
      try {
        const storageRef = ref(storageInstance, `${folder}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (firebaseError) {
        console.warn("Firebase storage upload failed:", firebaseError);
        // Continue to fallback
      }
    }
    
    // Fallback: Convert image to data URL
    if (file.type.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    }
    
    // Fallback for videos and other files
    if (file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    
    // Generic fallback
    throw new Error("File upload not supported in offline mode");
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => file.type.startsWith(type));
  }
};

// Export for manual initialization
export { initializeFirebase };
