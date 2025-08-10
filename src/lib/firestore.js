import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function userCol(userId) {
  return doc(db, "users", userId);
}

function propertiesCol(userId) {
  return collection(userCol(userId), "properties");
}

function propertyDoc(userId, propertyId) {
  return doc(propertiesCol(userId), propertyId);
}

function versionsCol(userId, propertyId) {
  return collection(propertyDoc(userId, propertyId), "versions");
}

export async function addProperty(userId, propertyData) {
  const colRef = propertiesCol(userId);
  const payload = { ...propertyData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const newDoc = await addDoc(colRef, payload);
  return newDoc.id;
}

export function getProperties(userId, callback) {
  const q = query(propertiesCol(userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function getProperty(userId, propertyId) {
  const snap = await getDoc(propertyDoc(userId, propertyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateProperty(userId, propertyId, propertyData) {
  await updateDoc(propertyDoc(userId, propertyId), { ...propertyData, updatedAt: serverTimestamp() });
}

export async function deleteProperty(userId, propertyId) {
  await deleteDoc(propertyDoc(userId, propertyId));
}

export async function addPropertyVersion(userId, propertyId, versionData) {
  const colRef = versionsCol(userId, propertyId);
  const payload = { ...versionData, createdAt: serverTimestamp() };
  const newDoc = await addDoc(colRef, payload);
  return newDoc.id;
}

export async function getPropertyVersions(userId, propertyId) {
  const q = query(versionsCol(userId, propertyId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


