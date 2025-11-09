import { useState, useRef, useCallback, useEffect } from "react";
import { Calendar } from "./components/Calendar";
import { BookingForm } from "./components/BookingForm";
import { useBookings } from "./hooks/useBookings";
import type { Booking } from "./types/booking";
import type { DateRange } from "./types/booking";

function App() {
  const { bookings, loading } = useBookings();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartDate = useRef<Date | null>(null);

  // Normalize date to start of day
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Get booking for a specific date
  const getBookingForDate = useCallback(
    (date: Date): Booking | undefined => {
      const normalized = normalizeDate(date);
      return bookings.find((booking) => {
        const start = normalizeDate(new Date(booking.startDate));
        const end = normalizeDate(new Date(booking.endDate));
        return normalized >= start && normalized <= end;
      });
    },
    [bookings]
  );

  // Handle date click
  const handleDateClick = (date: Date) => {
    const normalized = normalizeDate(date);
    const booking = getBookingForDate(normalized);

    // If clicking on a booked date, allow editing
    if (booking) {
      setEditingBooking(booking);
      setSelectedRange({
        start: normalizeDate(new Date(booking.startDate)),
        end: normalizeDate(new Date(booking.endDate)),
      });
      return;
    }

    // If we have a selected range and click a new date, start a new selection
    if (selectedRange && !isDragging) {
      setSelectedRange({
        start: normalized,
        end: normalized,
      });
      setEditingBooking(null);
      return;
    }

    // Single click - select just that date
    if (!isDragging) {
      setSelectedRange({
        start: normalized,
        end: normalized,
      });
      setEditingBooking(null);
    }
  };

  // Handle mouse down on date (start of drag)
  const handleDateMouseDown = (date: Date) => {
    const normalized = normalizeDate(date);
    const booking = getBookingForDate(normalized);

    // Don't start drag on booked dates
    if (booking) return;

    setIsDragging(true);
    dragStartDate.current = normalized;
    setSelectedRange({
      start: normalized,
      end: normalized,
    });
    setEditingBooking(null);
  };

  // Handle mouse enter on date (during drag)
  const handleDateMouseEnter = (date: Date) => {
    if (!isDragging || !dragStartDate.current) return;

    const normalized = normalizeDate(date);
    const booking = getBookingForDate(normalized);

    // Don't extend drag into booked dates
    if (booking) return;

    // Determine start and end based on drag direction
    const start =
      dragStartDate.current < normalized ? dragStartDate.current : normalized;
    const end =
      dragStartDate.current < normalized ? normalized : dragStartDate.current;

    setSelectedRange({ start, end });
  };

  // Handle mouse up (end of drag)
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartDate.current = null;
    }
  }, [isDragging]);

  // Add global mouse up listener
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  const handleBookingCreated = () => {
    setSelectedRange(null);
    setEditingBooking(null);
  };

  const handleBookingUpdated = () => {
    setSelectedRange(null);
    setEditingBooking(null);
  };

  const handleBookingDeleted = () => {
    setSelectedRange(null);
    setEditingBooking(null);
  };

  const handleWishAccepted = () => {
    setSelectedRange(null);
    setEditingBooking(null);
  };

  const handleCancel = () => {
    setSelectedRange(null);
    setEditingBooking(null);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    // If editing a booking, update the editing booking's dates
    if (editingBooking) {
      // The dates will be updated when the form is submitted
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Sommerhus Kalender
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              bookings={bookings}
              selectedRange={selectedRange}
              onDateClick={handleDateClick}
              onDateMouseEnter={handleDateMouseEnter}
              onDateMouseDown={handleDateMouseDown}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Booking Form */}
          <div>
            <BookingForm
              selectedRange={selectedRange}
              editingBooking={editingBooking}
              onBookingCreated={handleBookingCreated}
              onBookingUpdated={handleBookingUpdated}
              onBookingDeleted={handleBookingDeleted}
              onWishAccepted={handleWishAccepted}
              onCancel={handleCancel}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Sådan bruger du kalenderen:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Klik på en dato for at vælge den</li>
            <li>Klik og træk for at vælge flere datoer</li>
            <li>Klik på en booket dato for at redigere eller slette booking</li>
            <li>Du kan navigere mellem måneder med pilene</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
