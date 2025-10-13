import { initializeApp } from 'firebase/app';
import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { SessionProps, UserData } from '../../types';

// Firebase config and initialization
// Prod applications might use config file
const { FIRE_API_KEY, FIRE_DOMAIN, FIRE_PROJECT_ID } = process.env;
 
const firebaseConfig = {
  apiKey: FIRE_API_KEY,
  authDomain: FIRE_DOMAIN,
  projectId: FIRE_PROJECT_ID,
};
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function setUser ({ user }: SessionProps, storeHash: string) {
  if (!user || !storeHash) return null;

  const { email, id, username } = user;
  const ref = doc(db, "users", String(id));

  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    await setDoc(ref, { email, username, stores: [storeHash] });
  } else {
    await updateDoc(ref, { email, username: username || null, stores: arrayUnion(storeHash) });
  }
}
 
export async function setStore(session: SessionProps) {
  const {
    access_token: accessToken,
    context,
    scope,
    user: { id },
  } = session;
  // Only set on app install or update
  if (!accessToken || !scope) return null;
 
  const storeHash = context?.split('/')[1] || '';
  const ref = doc(db, 'stores', storeHash);
  const data = { accessToken, adminId: id, scope };
 
  await setDoc(ref, data);

  return ref.id;
}
 
export async function getStoreToken(storeHash: string) {
    if (!storeHash) return null;
    const storeDoc = await getDoc(doc(db, 'stores', storeHash));
 
    return storeDoc.data()?.accessToken ?? null;
}
 
export async function deleteStore(session: SessionProps) {
    const contextString = session?.context || session?.sub || '';
    const storeHash = contextString.split('/')[1] || '';

    if (!storeHash) return null;
    
    const ref = doc(db, 'stores', storeHash);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) return null;
    
    const userId = docSnap.data()?.adminId || '';

    await deleteDoc(ref);

    return [userId, storeHash];
}

export async function deleteUser(userId: string, storeHash: string) {
  if (!userId || !storeHash) return null;

  const userRef = doc(db, 'users', String(userId));
  const userSnapBefore = await getDoc(userRef);

  if (!userSnapBefore.exists()) {
    return null;
  }

  // Ensure we’re removing the correct hash
  try {
    await updateDoc(userRef, {
      stores: arrayRemove(storeHash),
    });
  } catch (error) {
    return null;
  }

  // Wait for Firestore consistency
  await new Promise((r) => setTimeout(r, 200));

  const userSnapAfter = await getDoc(userRef);
  const dataAfter = userSnapAfter.data();

  if (!dataAfter?.stores?.length) {
    await deleteDoc(userRef);
  }
}