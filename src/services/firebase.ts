import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import type { Booking } from "../types/booking";

// Firebase configuration - these will be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to convert Firestore Timestamp to ISO string
const timestampToISO = (timestamp: Timestamp | string): string => {
  if (typeof timestamp === "string") return timestamp;
  return timestamp.toDate().toISOString();
};

// Helper function to convert ISO string to Firestore Timestamp
const isoToTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString));
};

// Fetch all bookings
export const getBookings = async (): Promise<Booking[]> => {
  const bookingsCollection = collection(db, "bookings");
  const bookingsSnapshot = await getDocs(bookingsCollection);

  return bookingsSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    startDate: timestampToISO(doc.data().startDate),
    endDate: timestampToISO(doc.data().endDate),
    createdAt: timestampToISO(doc.data().createdAt),
  }));
};

// Subscribe to bookings changes (real-time updates)
export const subscribeToBookings = (
  callback: (bookings: Booking[]) => void
): (() => void) => {
  const bookingsCollection = collection(db, "bookings");

  return onSnapshot(bookingsCollection, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      startDate: timestampToISO(doc.data().startDate),
      endDate: timestampToISO(doc.data().endDate),
      createdAt: timestampToISO(doc.data().createdAt),
    }));
    callback(bookings);
  });
};

// Create a new booking
export const createBooking = async (
  name: string,
  startDate: string,
  endDate: string
): Promise<string> => {
  const bookingsCollection = collection(db, "bookings");

  const docRef = await addDoc(bookingsCollection, {
    name,
    startDate: isoToTimestamp(startDate),
    endDate: isoToTimestamp(endDate),
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

// Update an existing booking
export const updateBooking = async (
  id: string,
  name: string,
  startDate: string,
  endDate: string
): Promise<void> => {
  const bookingRef = doc(db, "bookings", id);

  await updateDoc(bookingRef, {
    name,
    startDate: isoToTimestamp(startDate),
    endDate: isoToTimestamp(endDate),
  });
};

// Delete a booking
export const deleteBooking = async (id: string): Promise<void> => {
  const bookingRef = doc(db, "bookings", id);
  await deleteDoc(bookingRef);
};

// Check if dates are available (don't overlap with existing bookings)
export const checkDateAvailability = async (
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<boolean> => {
  const bookings = await getBookings();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Normalize dates to start of day for comparison
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const normalizedStart = normalizeDate(start);
  const normalizedEnd = normalizeDate(end);

  for (const booking of bookings) {
    // Skip the booking we're updating
    if (excludeId && booking.id === excludeId) {
      continue;
    }

    const bookingStart = normalizeDate(new Date(booking.startDate));
    const bookingEnd = normalizeDate(new Date(booking.endDate));

    // Check for overlap: new booking overlaps if it starts before existing ends and ends after existing starts
    if (normalizedStart <= bookingEnd && normalizedEnd >= bookingStart) {
      return false; // Dates are not available
    }
  }

  return true; // Dates are available
};
