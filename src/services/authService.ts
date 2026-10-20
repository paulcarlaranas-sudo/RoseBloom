import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { UserProfile, SavedGoogleAccount } from '../types';

const AUTH_STORAGE_KEY = 'rosebloom_auth_user';
const GOOGLE_ACCOUNTS_KEY = 'rosebloom_saved_google_accounts';

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getGoogleAvatarUrl(name: string, email: string): string {
  const seed = encodeURIComponent((name.trim() || email.split('@')[0]).trim());
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffd5dc`;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];
  private isFirebaseInitialized: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.initFirebaseAuthListener();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private initFirebaseAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      this.isFirebaseInitialized = true;
      if (firebaseUser) {
        const userProfile = await this.syncFirebaseUserToProfile(firebaseUser);
        this.currentUser = userProfile;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        // If not signed in to Firebase and was logged in via Firebase, clear local state
        if (this.currentUser && !this.currentUser.id.startsWith('usr_demo_')) {
          this.currentUser = null;
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      this.notify();
    });
  }

  private async syncFirebaseUserToProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const isGoogle = firebaseUser.providerData.some((p) => p.providerId === 'google.com');
    const email = firebaseUser.email || '';
    const name = firebaseUser.displayName || email.split('@')[0] || 'My Love';
    const photo = firebaseUser.photoURL || getGoogleAvatarUrl(name, email);

    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      name,
      email,
      googleLinked: isGoogle,
      googleEmail: isGoogle ? email : undefined,
      googleSub: firebaseUser.uid,
      verifiedGoogle: isGoogle,
      avatarUrl: photo,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };

    // Save to device Google accounts list if it's a Google login
    if (isGoogle && email) {
      this.saveGoogleAccount({
        email,
        name,
        avatarUrl: photo,
        sub: firebaseUser.uid,
        lastUsedAt: new Date().toISOString(),
      });
    }

    // Persist to Firestore /users/{uid}
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const existingSnap = await getDoc(userDocRef);
      if (!existingSnap.exists()) {
        await setDoc(userDocRef, {
          id: firebaseUser.uid,
          name,
          email,
          googleLinked: isGoogle,
          googleEmail: isGoogle ? email : null,
          avatarUrl: photo,
          createdAt: userProfile.createdAt,
        });
      }
    } catch (err) {
      console.warn('Could not sync user profile to Firestore:', err);
    }

    return userProfile;
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  public subscribe(listener: (user: UserProfile | null) => void) {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public getSavedGoogleAccounts(): SavedGoogleAccount[] {
    try {
      const raw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
      if (raw) {
        const list: SavedGoogleAccount[] = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch {
      // Ignore
    }
    return [];
  }

  public saveGoogleAccount(acc: SavedGoogleAccount): void {
    const list = this.getSavedGoogleAccounts();
    const cleanEmail = acc.email.trim().toLowerCase();
    const updated = list.filter((a) => a.email.toLowerCase() !== cleanEmail);
    updated.unshift({
      email: cleanEmail,
      name: acc.name.trim() || cleanEmail.split('@')[0],
      avatarUrl: acc.avatarUrl || getGoogleAvatarUrl(acc.name, cleanEmail),
      sub: acc.sub,
      lastUsedAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  public removeSavedGoogleAccount(email: string): void {
    const list = this.getSavedGoogleAccounts();
    const updated = list.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    try {
      localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  /**
   * Real Google Authentication via Firebase Auth Popup
   * Opens Google's authentic accounts.google.com sign-in window for ANY user!
   */
  public async signInWithGooglePopup(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await this.syncFirebaseUserToProfile(result.user);
      this.currentUser = profile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return profile;
    } catch (err: unknown) {
      console.warn('Firebase signInWithPopup failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Google authentication failed';
      throw new Error(errorMsg);
    }
  }

  /**
   * Manual Google account sign-in fallback (e.g. if popups are blocked by browser)
   */
  public async signInWithGoogleAccount(accountData: {
    email: string;
    name: string;
    avatarUrl?: string;
    sub?: string;
  }): Promise<UserProfile> {
    const cleanEmail = accountData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid Google email address.');
    }

    const cleanName = accountData.name.trim() || cleanEmail.split('@')[0];
    const avatar = accountData.avatarUrl || getGoogleAvatarUrl(cleanName, cleanEmail);

    this.saveGoogleAccount({
      email: cleanEmail,
      name: cleanName,
      avatarUrl: avatar,
      sub: accountData.sub,
      lastUsedAt: new Date().toISOString(),
    });

    const uniqueId = accountData.sub || 'usr_g_' + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      id: uniqueId,
      name: cleanName,
      email: cleanEmail,
      googleLinked: true,
      googleEmail: cleanEmail,
      googleSub: accountData.sub,
      verifiedGoogle: true,
      avatarUrl: avatar,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.currentUser = profile;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return profile;
  }

  public async signInWithGoogleJwt(credential: string): Promise<UserProfile> {
    const payload = parseJwt(credential);
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid Google credential token received.');
    }

    const email = String(payload.email || '');
    const name = String(payload.name || payload.given_name || email.split('@')[0]);
    const picture = String(payload.picture || '');
    const sub = String(payload.sub || '');

    return this.signInWithGoogleAccount({
      email,
      name,
      avatarUrl: picture,
      sub,
    });
  }

  /**
   * Firebase Email & Password Sign In
   */
  public async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email address is required.');

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await this.syncFirebaseUserToProfile(result.user);
      this.currentUser = profile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return profile;
    } catch (err: unknown) {
      // If user doesn't exist yet, auto sign-up with Firebase
      const errStr = err instanceof Error ? err.message : '';
      if (errStr.includes('user-not-found') || errStr.includes('invalid-credential')) {
        try {
          return await this.signUpWithEmail(cleanEmail.split('@')[0], cleanEmail, pass);
        } catch {
          throw new Error('Invalid email or password.');
        }
      }
      throw new Error(err instanceof Error ? err.message : 'Sign in failed.');
    }
  }

  /**
   * Firebase Email & Password Sign Up
   */
  public async signUpWithEmail(name: string, email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await firebaseUpdateProfile(result.user, { displayName: cleanName });
      const profile = await this.syncFirebaseUserToProfile(result.user);
      this.currentUser = profile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return profile;
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Sign up failed.');
    }
  }

  /**
   * Load Sample Demo Workspace
   */
  public async loadSampleDemoUser(): Promise<UserProfile> {
    const sampleUser: UserProfile = {
      id: 'usr_maya_love_01',
      name: 'Liam',
      email: 'mikuchanmawaifu@gmail.com',
      googleLinked: true,
      googleEmail: 'mikuchanmawaifu@gmail.com',
      verifiedGoogle: true,
      avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Liam&backgroundColor=ffd5dc',
      createdAt: '2024-10-24',
    };

    this.currentUser = sampleUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }

  public async updateProfile(name: string, avatarUrl?: string): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');

    const cleanName = name.trim() || this.currentUser.name;
    const photo = avatarUrl || this.currentUser.avatarUrl || getGoogleAvatarUrl(cleanName, this.currentUser.email);

    if (auth.currentUser) {
      try {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: cleanName,
          photoURL: photo,
        });
      } catch (err) {
        console.warn('Could not update Firebase profile:', err);
      }
    }

    this.currentUser = {
      ...this.currentUser,
      name: cleanName,
      avatarUrl: photo,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));

    // Update in Firestore
    try {
      const userRef = doc(db, 'users', this.currentUser.id);
      await setDoc(userRef, { name: cleanName, avatarUrl: photo }, { merge: true });
    } catch {
      // Ignore
    }

    this.notify();
    return this.currentUser;
  }

  public async updateEmail(newEmail: string): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');
    const emailClean = newEmail.trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    this.currentUser = {
      ...this.currentUser,
      email: emailClean,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async changePassword(oldPass: string, newPass: string): Promise<void> {
    if (!this.currentUser) throw new Error('Not authenticated');
    if (newPass.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
  }

  public async linkGoogleAccount(googleEmail: string, googleName?: string, avatarUrl?: string): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName?.trim() || this.currentUser.name;

    this.currentUser = {
      ...this.currentUser,
      googleLinked: true,
      googleEmail: cleanEmail,
      verifiedGoogle: true,
      avatarUrl: avatarUrl || this.currentUser.avatarUrl,
    };

    this.saveGoogleAccount({
      email: cleanEmail,
      name: cleanName,
      avatarUrl: this.currentUser.avatarUrl,
      lastUsedAt: new Date().toISOString(),
    });

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async unlinkGoogleAccount(): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');

    this.currentUser = {
      ...this.currentUser,
      googleLinked: false,
      googleEmail: undefined,
      verifiedGoogle: false,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }
}

export const authService = new AuthService();
