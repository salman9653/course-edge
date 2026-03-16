import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "../firebase/client";

/**
 * Registers a new user with email, password and name
 */
export async function registerWithEmail(email: string, password: string, name: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the profile with the user's name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user with email and password", error);
    throw error;
  }
}

/**
 * Logs in an existing user with email and password
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in with email and password", error);
    throw error;
  }
}

/**
 * Logs out the current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out", error);
    throw error;
  }
}
