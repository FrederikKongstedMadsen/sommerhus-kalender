import { useState, useEffect } from "react";
import {
  createBooking,
  updateBooking,
  deleteBooking,
  checkDateAvailability,
  acceptWish,
} from "../services/firebase";
import type { Booking, BookingType, BookingColor } from "../types/booking";
import type { DateRange } from "../types/booking";

interface BookingFormProps {
  selectedRange: DateRange | null;
  editingBooking: Booking | null;
  onBookingCreated: () => void;
  onBookingUpdated: () => void;
  onBookingDeleted: () => void;
  onWishAccepted: () => void;
  onCancel: () => void;
  onDateRangeChange: (range: DateRange) => void;
}

export const BookingForm = ({
  selectedRange,
  editingBooking,
  onBookingCreated,
  onBookingUpdated,
  onBookingDeleted,
  onWishAccepted,
  onCancel,
  onDateRangeChange,
}: BookingFormProps) => {
  const [name, setName] = useState(editingBooking?.name || "");
  const [note, setNote] = useState(editingBooking?.note || "");
  const [color, setColor] = useState<BookingColor | undefined>(
    editingBooking?.color
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>(
    editingBooking?.type || "booking"
  );

  // Available colors
  const availableColors: { value: BookingColor; label: string; bg: string }[] =
    [
      { value: "blue", label: "Blå", bg: "bg-blue-200" },
      { value: "green", label: "Grøn", bg: "bg-green-200" },
      { value: "yellow", label: "Gul", bg: "bg-yellow-200" },
      { value: "purple", label: "Lilla", bg: "bg-purple-200" },
      { value: "pink", label: "Pink", bg: "bg-pink-200" },
      { value: "indigo", label: "Indigo", bg: "bg-indigo-200" },
      { value: "orange", label: "Orange", bg: "bg-orange-200" },
      { value: "red", label: "Rød", bg: "bg-red-200" },
      { value: "teal", label: "Turkis", bg: "bg-teal-200" },
    ];

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

  // Update form when editingBooking changes
  useEffect(() => {
    if (editingBooking) {
      setName(editingBooking.name);
      setNote(editingBooking.note || "");
      setColor(editingBooking.color);
      setBookingType(editingBooking.type);
      const start = new Date(editingBooking.startDate);
      const end = new Date(editingBooking.endDate);
      setLocalStartDate(formatDateForInput(start));
      setLocalEndDate(formatDateForInput(end));
      setError(null);
    } else {
      setName("");
      setNote("");
      setColor(undefined);
      setBookingType("booking");
      setLocalStartDate("");
      setLocalEndDate("");
      setError(null);
    }
  }, [editingBooking]);

  // Update dates when selectedRange changes (only when not editing)
  useEffect(() => {
    if (!editingBooking && selectedRange) {
      setLocalStartDate(formatDateForInput(selectedRange.start));
      setLocalEndDate(formatDateForInput(selectedRange.end));
    } else if (!editingBooking && !selectedRange) {
      setLocalStartDate("");
      setLocalEndDate("");
    }
  }, [selectedRange, editingBooking]);

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

      // Check availability for both bookings and wishes
      const isAvailable = await checkDateAvailability(
        startDateISO,
        endDateISO,
        editingBooking?.id
      );

      if (!isAvailable) {
        setError(
          bookingType === "wish"
            ? "Disse datoer er allerede booket eller ønsket"
            : "Disse datoer er allerede booket eller ønsket"
        );
        setIsSubmitting(false);
        return;
      }

      if (editingBooking) {
        // Update existing booking
        await updateBooking(
          editingBooking.id,
          name.trim(),
          startDateISO,
          endDateISO,
          bookingType,
          note.trim() || undefined,
          color
        );
        onBookingUpdated();
      } else {
        // Create new booking or wish
        await createBooking(
          name.trim(),
          startDateISO,
          endDateISO,
          bookingType,
          note.trim() || undefined,
          color
        );
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
        `Er du sikker på, at du vil slette ${
          editingBooking.type === "wish" ? "ønsket" : "bookingen"
        } for ${editingBooking.name}?`
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

  const handleAcceptWish = async () => {
    if (!editingBooking || editingBooking.type !== "wish") return;

    setIsSubmitting(true);
    setError(null);

    try {
      await acceptWish(editingBooking.id);
      onWishAccepted();
    } catch (err) {
      setError("Der opstod en fejl ved accept af ønske. Prøv igen.");
      console.error("Error accepting wish:", err);
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
        {editingBooking
          ? editingBooking.type === "wish"
            ? "Rediger ønske"
            : "Rediger booking"
          : "Opret booking eller ønske"}
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
        {!editingBooking && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="booking"
                  checked={bookingType === "booking"}
                  onChange={(e) =>
                    setBookingType(e.target.value as BookingType)
                  }
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <span>Booking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="wish"
                  checked={bookingType === "wish"}
                  onChange={(e) =>
                    setBookingType(e.target.value as BookingType)
                  }
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <span>Ønske</span>
              </label>
            </div>
          </div>
        )}

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

        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Note (valgfrit)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tilføj en note til bookingen..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farve (valgfrit)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableColors.map((colorOption) => (
              <label
                key={colorOption.value}
                className={`
                  flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    color === colorOption.value
                      ? "border-blue-600 ring-2 ring-blue-300"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${colorOption.bg}
                `}
              >
                <input
                  type="radio"
                  name="color"
                  value={colorOption.value}
                  checked={color === colorOption.value}
                  onChange={(e) => setColor(e.target.value as BookingColor)}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium text-gray-800">
                  {colorOption.label}
                </span>
              </label>
            ))}
            <label
              className={`
                flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all bg-white
                ${
                  color === undefined
                    ? "border-blue-600 ring-2 ring-blue-300"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <input
                type="radio"
                name="color"
                value=""
                checked={color === undefined}
                onChange={() => setColor(undefined)}
                className="sr-only"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-600">
                Standard
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "Gemmer..."
              : editingBooking
              ? "Opdater"
              : bookingType === "wish"
              ? "Opret ønske"
              : "Opret booking"}
          </button>

          {editingBooking && editingBooking.type === "wish" && (
            <button
              type="button"
              onClick={handleAcceptWish}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Acceptér ønske
            </button>
          )}

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
