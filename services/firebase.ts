
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut, 
  updateProfile,
  User 
} from "firebase/auth";
import { UserProfile } from "../types";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../constants";
import { StorageService } from "./storageService";

// ------------------------------------------------------------------
// FIREBASE WEB CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyALgvrih8jpu7qrJ1VVhsJFcv_ehLdKTtI",
  authDomain: "roza-news.firebaseapp.com",
  projectId: "roza-news",
  messagingSenderId: "139138582160",
  appId: "1:139138582160:web:429592856867f42aacba15",
  measurementId: "G-WR3KVDQN96"
};

// Known Admin Emails for Auto-Role Assignment
const ADMIN_EMAILS = ['rozanewsofficial@gmail.com', 'saifujafar895@gmail.com'];

// Initialize variables
let app: FirebaseApp;
let auth: Auth | null = null;

try {
  // 1. Initialize App
  app = initializeApp(firebaseConfig);
  
  // 2. Initialize Auth
  try {
    auth = getAuth(app);
  } catch (authError) {
    console.error("Firebase Auth failed to initialize. Check import maps.", authError);
  }
} catch (error) {
  console.error("Critical Firebase Initialization Error:", error);
}

const googleProvider = new GoogleAuthProvider();

export const AuthService = {
  getAuthInstance: () => auth,

  // --- GOOGLE AUTH ---
  signInWithGoogle: async (): Promise<UserProfile | null> => {
    if (!auth) throw new Error("Authentication service is currently unavailable. Refresh the page.");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return AuthService.mapFirebaseUserToProfile(result.user);
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  },

  // --- EMAIL/PASSWORD REGISTER ---
  registerWithEmail: async (name: string, email: string, pass: string): Promise<UserProfile | null> => {
    if (!auth) throw new Error("Auth service unavailable.");
    try {
      // 1. Create User
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      
      // 2. Update Profile with Name
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
      }
      
      // 3. Return formatted profile
      return AuthService.mapFirebaseUserToProfile(result.user);
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw error;
    }
  },

  // --- EMAIL/PASSWORD LOGIN ---
  loginWithEmail: async (email: string, pass: string): Promise<UserProfile | null> => {
    if (!auth) throw new Error("Auth service unavailable.");
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return AuthService.mapFirebaseUserToProfile(result.user);
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // --- PHONE AUTH HELPERS ---
  clearRecaptcha: () => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Recaptcha clear error", e);
      }
      (window as any).recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  },

  setupRecaptcha: (elementId: string) => {
    if (!auth) return null;
    
    // Clear existing to avoid "already rendered" error
    AuthService.clearRecaptcha();

    try {
      // Use modular RecaptchaVerifier
      const verifier = new RecaptchaVerifier(auth, elementId, {
        'size': 'invisible',
        'callback': () => {
           console.log("Recaptcha verified");
        },
        'expired-callback': () => {
           console.warn("Recaptcha expired");
           AuthService.clearRecaptcha();
        }
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (e) {
      console.error("Recaptcha Setup Error:", e);
      throw e;
    }
  },

  signInWithPhone: async (phoneNumber: string, appVerifier: any) => {
    if (!auth) throw new Error("Auth service unavailable.");
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  },

  logout: async () => {
    if (auth) await signOut(auth);
  },

  mapFirebaseUserToProfile: (firebaseUser: User | null): UserProfile => {
    if (!firebaseUser) throw new Error("No user found");
    const isPhone = !firebaseUser.email && firebaseUser.phoneNumber;
    
    // Create a consistent ID
    const userId = firebaseUser.uid;
    const userEmail = firebaseUser.email || "";

    // Determine Role based on predefined admin list
    const role = ADMIN_EMAILS.includes(userEmail) ? 'admin' : 'user';
    
    return {
      id: userId,
      name: firebaseUser.displayName || (isPhone ? "Mobile User" : "Anonymous"),
      email: userEmail, 
      phoneNumber: firebaseUser.phoneNumber || undefined,
      avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.phoneNumber || 'User')}&background=random`,
      joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      role: role,
      notificationsEnabled: false
    };
  }
};

export const MediaService = {
  uploadFile: async (file: File, folder: string = 'uploads'): Promise<string> => {
    const savedConfig = StorageService.getCloudinaryConfig();
    const cloudName = savedConfig.cloudName || CLOUDINARY_CLOUD_NAME;
    const preset = savedConfig.uploadPreset || CLOUDINARY_UPLOAD_PRESET;

    // 1. Try Cloudinary First (Preferred for everything)
    if (cloudName && cloudName !== "demo" && preset) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", preset);
          formData.append("folder", folder);
          const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            { method: "POST", body: formData }
          );

          if (!response.ok) throw new Error("Cloudinary Upload Failed");
          const data = await response.json();
          return data.secure_url;

        } catch (error) {
          console.error("Cloudinary Error:", error);
          throw new Error("Cloudinary upload failed. Please check your internet connection.");
        }
    }

    // 2. No Firebase Storage Fallback anymore. 
    
    // 3. Fallback for Images Only (Base64)
    if (file.type.startsWith('video/')) {
        throw new Error("Video upload requires Cloudinary. Please configure Cloudinary in Admin Panel > Cloud Sync.");
    }
    
    console.warn("Cloudinary not configured. Saving image as Base64 (Local only).");
    return MediaService.compressImage(file);
  },

  compressImage: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(img.src); return; }
          const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
