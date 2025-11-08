import { useState, useEffect } from "react";
import {
  createBooking,
  updateBooking,
  deleteBooking,
  checkDateAvailability,
} from "../services/firebase";
import type { Booking } from "../types/booking";
import type { DateRange } from "../types/booking";

interface BookingFormProps {
  selectedRange: DateRange | null;
  editingBooking: Booking | null;
  onBookingCreated: () => void;
  onBookingUpdated: () => void;
  onBookingDeleted: () => void;
  onCancel: () => void;
  onDateRangeChange: (range: DateRange) => void;
}

export const BookingForm = ({
  selectedRange,
  editingBooking,
  onBookingCreated,
  onBookingUpdated,
  onBookingDeleted,
  onCancel,
  onDateRangeChange,
}: BookingFormProps) => {
  const [name, setName] = useState(editingBooking?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for editable dates
  const [localStartDate, setLocalStartDate] = useState<string>("");
  const [localEndDate, setLocalEndDate] = useState<string>("");

  // Helper to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (editingBooking) {
      setName(editingBooking.name);
      const start = new Date(editingBooking.startDate);
      const end = new Date(editingBooking.endDate);
      setLocalStartDate(formatDateForInput(start));
      setLocalEndDate(formatDateForInput(end));
    } else if (selectedRange) {
      setName("");
      setLocalStartDate(formatDateForInput(selectedRange.start));
      setLocalEndDate(formatDateForInput(selectedRange.end));
    } else {
      setName("");
      setLocalStartDate("");
      setLocalEndDate("");
    }
    setError(null);
  }, [editingBooking, selectedRange]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setLocalStartDate(newDate);

    if (newDate) {
      const start = new Date(newDate);
      start.setHours(0, 0, 0, 0);

      // Use end date if available, otherwise use start date (single day)
      const end = localEndDate ? new Date(localEndDate) : new Date(start);
      end.setHours(0, 0, 0, 0);

      // Ensure start is before or equal to end
      if (start > end) {
        setLocalEndDate(newDate);
        end.setTime(start.getTime());
      }

      onDateRangeChange({ start, end });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setLocalEndDate(newDate);

    if (newDate) {
      const end = new Date(newDate);
      end.setHours(0, 0, 0, 0);

      // Use start date if available, otherwise use end date (single day)
      const start = localStartDate ? new Date(localStartDate) : new Date(end);
      start.setHours(0, 0, 0, 0);

      // Ensure end is after or equal to start
      if (end < start) {
        setLocalStartDate(newDate);
        start.setTime(end.getTime());
      }

      onDateRangeChange({ start, end });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Indtast venligst et navn");
      return;
    }

    if (!localStartDate || !localEndDate) {
      setError("Vælg venligst start- og slutdato");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use local date state (validated above)
      const startDate = new Date(localStartDate);
      const endDate = new Date(localEndDate);

      // Normalize dates to start of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();

      // Check availability
      const isAvailable = await checkDateAvailability(
        startDateISO,
        endDateISO,
        editingBooking?.id
      );

      if (!isAvailable) {
        setError("Disse datoer er allerede booket");
        setIsSubmitting(false);
        return;
      }

      if (editingBooking) {
        // Update existing booking
        await updateBooking(
          editingBooking.id,
          name.trim(),
          startDateISO,
          endDateISO
        );
        onBookingUpdated();
      } else {
        // Create new booking
        await createBooking(name.trim(), startDateISO, endDateISO);
        onBookingCreated();
      }

      setName("");
      setError(null);
    } catch (err) {
      setError("Der opstod en fejl. Prøv igen.");
      console.error("Error saving booking:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingBooking) return;

    if (
      !confirm(
        `Er du sikker på, at du vil slette bookingen for ${editingBooking.name}?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteBooking(editingBooking.id);
      onBookingDeleted();
      setName("");
    } catch (err) {
      setError("Der opstod en fejl ved sletning. Prøv igen.");
      console.error("Error deleting booking:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRange = editingBooking
    ? {
        start: new Date(editingBooking.startDate),
        end: new Date(editingBooking.endDate),
      }
    : selectedRange;

  if (!displayRange && !editingBooking) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingBooking ? "Rediger booking" : "Opret booking"}
      </h3>

      {displayRange && (
        <div className="mb-4 space-y-3">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Startdato
            </label>
            <input
              type="date"
              id="startDate"
              value={localStartDate}
              onChange={handleStartDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Slutdato
            </label>
            <input
              type="date"
              id="endDate"
              value={localEndDate}
              onChange={handleEndDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div className="text-xs text-gray-500 italic">
            {displayRange.start.toDateString() ===
            displayRange.end.toDateString()
              ? formatDate(displayRange.start)
              : `${formatDate(displayRange.start)} - ${formatDate(
                  displayRange.end
                )}`}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Navn
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Indtast dit navn"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "Gemmer..."
              : editingBooking
              ? "Opdater"
              : "Opret booking"}
          </button>

          {editingBooking && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Slet
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Annuller
          </button>
        </div>
      </form>
    </div>
  );
};
