import { useState, useEffect } from "react";
import { subscribeToBookings } from "../services/firebase";
import type { Booking } from "../types/booking";

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { bookings, loading, error };
};
