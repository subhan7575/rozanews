
import { initializeApp, FirebaseApp, getApp, getApps } from "firebase/app";
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
import { getFirestore, Firestore, doc, setDoc, initializeFirestore, collection, getDocs, query, limit } from "firebase/firestore";

import { UserProfile } from "../types";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, ADMIN_EMAILS } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyALgvrih8jpu7qrJ1VVhsJFcv_ehLdKTtI",
  authDomain: "roza-news.firebaseapp.com",
  projectId: "roza-news",
  messagingSenderId: "139138582160",
  appId: "1:139138582160:web:429592856867f42aacba15",
  measurementId: "G-WR3KVDQN96"
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

const getFirebaseAuth = () => {
  if (!authInstance) authInstance = getAuth(app);
  return authInstance;
};

export const getFirebaseDb = () => {
  if (!dbInstance) {
    try {
      dbInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
};

const googleProvider = new GoogleAuthProvider();

export const AuthService = {
  getAuthInstance: () => getFirebaseAuth(),

  /**
   * Syncs user profile to global Firestore 'users' collection
   */
  syncUserToCloud: async (user: UserProfile) => {
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, "users", user.id), {
        ...user,
        lastActive: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Cloud sync failed:", e);
    }
  },

  signInWithGoogle: async (): Promise<UserProfile | null> => {
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, googleProvider);
      const profile = AuthService.mapFirebaseUserToProfile(result.user);
      await AuthService.syncUserToCloud(profile);
      return profile;
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      throw err;
    }
  },

  registerWithEmail: async (
    name: string,
    email: string,
    pass: string
  ): Promise<UserProfile | null> => {
    try {
      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
      }
      const profile = AuthService.mapFirebaseUserToProfile(result.user);
      await AuthService.syncUserToCloud(profile);
      return profile;
    } catch (err: any) {
      throw err;
    }
  },

  loginWithEmail: async (
    email: string,
    pass: string
  ): Promise<UserProfile | null> => {
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const profile = AuthService.mapFirebaseUserToProfile(result.user);
      await AuthService.syncUserToCloud(profile);
      return profile;
    } catch (err: any) {
      throw err;
    }
  },

  clearRecaptcha: () => {
    try {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
    } catch (e) {
      console.warn("Recaptcha clear failed", e);
    }
  },

  setupRecaptcha: (elementId: string) => {
    const auth = getFirebaseAuth();
    AuthService.clearRecaptcha();
    try {
      const verifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {}
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (err) {
      console.error("Recaptcha Init Failed:", err);
      return null;
    }
  },

  signInWithPhone: async (phoneNumber: string, appVerifier: any) => {
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return result;
    } catch (err: any) {
      throw err;
    }
  },

  logout: async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  },

  mapFirebaseUserToProfile: (firebaseUser: User | null): UserProfile => {
    if (!firebaseUser) throw new Error("User mapping failed.");

    const email = firebaseUser.email || "";
    const role = ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase()) ? "admin" : "user";
    const name = firebaseUser.displayName || (firebaseUser.phoneNumber ? "Mobile User" : "Roza Reader");

    return {
      id: firebaseUser.uid,
      name: name,
      email,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      avatar:
        firebaseUser.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      joinedAt:
        firebaseUser.metadata.creationTime || new Date().toISOString(),
      role: role as 'user' | 'admin',
      notificationsEnabled: false
    };
  }
};

export const MediaService = {
  uploadFile: async (file: File, folder = "uploads"): Promise<string> => {
    let cloudName = CLOUDINARY_CLOUD_NAME;
    let preset = CLOUDINARY_UPLOAD_PRESET;

    try {
      const savedConfigStr = localStorage.getItem('roza_cloudinary_config');
      if (savedConfigStr) {
         const savedConfig = JSON.parse(savedConfigStr);
         if (savedConfig.cloudName) cloudName = savedConfig.cloudName;
         if (savedConfig.uploadPreset) preset = savedConfig.uploadPreset;
      }
    } catch (e) {}

    if (cloudName && cloudName !== "demo" && preset) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", preset);
        formData.append("folder", folder);

        const resourceType = file.type.startsWith("video/") ? "video" : "image";
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        const data = await response.json();
        if (data.secure_url) return data.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed", err);
      }
    }

    return MediaService.compressImage(file);
  },

  compressImage: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(img.src);
          const MAX = 1200;
          let { width, height } = img;
          if (width > height && width > MAX) {
            height *= MAX / width;
            width = MAX;
          } else if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
      };
      reader.onerror = reject;
    });
  }
};
