import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  User
} from "firebase/auth";
import { UserProfile } from "../types";

// ------------------------------------------------------------------
// FIREBASE WEB CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyALgvrih8jpu7qrJ1VVhsJFcv_ehLdKTtI",
  authDomain: "roza-news.firebaseapp.com",
  projectId: "roza-news",
  storageBucket: "roza-news.firebasestorage.app",
  messagingSenderId: "139138582160",
  appId: "1:139138582160:web:429592856867f42aacba15",
  measurementId: "G-WR3KVDQN96"
};

// Initialize Firebase
let auth: any;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

const googleProvider = new GoogleAuthProvider();

export const AuthService = {
  getAuthInstance: () => auth,

  // 1. Google Sign In
  signInWithGoogle: async (): Promise<UserProfile | null> => {
    try {
      if (!auth) throw new Error("Firebase not configured");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return AuthService.mapFirebaseUserToProfile(user);
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  },

  // 2. Phone Sign In Setup
  setupRecaptcha: (elementId: string) => {
    if (!auth) return null;
    // Clear previous instance if exists to avoid error
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    } catch (e) {}

    const verifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': () => {
        console.log("Recaptcha verified");
      }
    });
    window.recaptchaVerifier = verifier;
    return verifier;
  },

  signInWithPhone: async (phoneNumber: string, appVerifier: any) => {
    if (!auth) throw new Error("Firebase not configured");
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  },

  // 3. Logout
  logout: async () => {
    if (auth) await signOut(auth);
  },

  // Helper to convert Firebase User to our App's User format
  mapFirebaseUserToProfile: (firebaseUser: User): UserProfile => {
    const isPhone = !firebaseUser.email && firebaseUser.phoneNumber;
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || (isPhone ? "Mobile User" : "Anonymous"),
      email: firebaseUser.email || "",
      phoneNumber: firebaseUser.phoneNumber || undefined,
      avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=random`,
      joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      role: 'user'
    };
  }
};

// Add type for window object
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}