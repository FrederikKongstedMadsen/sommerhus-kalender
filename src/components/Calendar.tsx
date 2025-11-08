import { useMemo } from "react";
import { CalendarDay } from "./CalendarDay";
import type { Booking } from "../types/booking";
import type { DateRange } from "../types/booking";

interface CalendarProps {
  bookings: Booking[];
  selectedRange: DateRange | null;
  onDateClick: (date: Date) => void;
  onDateMouseEnter: (date: Date) => void;
  onDateMouseDown: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const Calendar = ({
  bookings,
  selectedRange,
  onDateClick,
  onDateMouseEnter,
  onDateMouseDown,
  currentMonth,
  onMonthChange,
}: CalendarProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the first day of the month and the number of days
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const daysInMonth = lastDayOfMonth.getDate();

  // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Calculate days to show from previous month
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0

  // Generate all days to display
  const calendarDays = useMemo(() => {
    const days: Date[] = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - i - 1);
      days.push(date);
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i
      );
      days.push(date);
    }

    // Add days from next month to fill the grid (6 weeks = 42 days)
    const totalDays = days.length;
    const daysToAdd = 42 - totalDays;
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        i
      );
      days.push(date);
    }

    return days;
  }, [currentMonth, daysFromPrevMonth, daysInMonth, firstDayOfMonth]);

  // Helper function to check if a date is in a booking
  const getBookingForDate = (date: Date): Booking | undefined => {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return bookings.find((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return dateCopy >= start && dateCopy <= end;
    });
  };

  // Helper function to check if date is in selected range
  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange) return false;
    const dateStr = date.toISOString().split("T")[0];
    const startStr = selectedRange.start.toISOString().split("T")[0];
    const endStr = selectedRange.end.toISOString().split("T")[0];
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isDateRangeStart = (date: Date): boolean => {
    if (!selectedRange) return false;
    const dateStr = date.toISOString().split("T")[0];
    const startStr = selectedRange.start.toISOString().split("T")[0];
    return dateStr === startStr;
  };

  const isDateRangeEnd = (date: Date): boolean => {
    if (!selectedRange) return false;
    const dateStr = date.toISOString().split("T")[0];
    const endStr = selectedRange.end.toISOString().split("T")[0];
    return dateStr === endStr;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onMonthChange(newDate);
  };

  const monthNames = [
    "Januar",
    "Februar",
    "Marts",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "December",
  ];

  const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ← Forrige
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={() => navigateMonth("next")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Næste →
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dateCopy = new Date(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = dateCopy.toDateString() === today.toDateString();
          const booking = getBookingForDate(dateCopy);
          const isSelected = !!(
            selectedRange &&
            (dateCopy.toISOString().split("T")[0] ===
              selectedRange.start.toISOString().split("T")[0] ||
              dateCopy.toISOString().split("T")[0] ===
                selectedRange.end.toISOString().split("T")[0])
          );
          const isInRange = isDateInRange(dateCopy);
          const isRangeStart = isDateRangeStart(dateCopy);
          const isRangeEnd = isDateRangeEnd(dateCopy);

          return (
            <CalendarDay
              key={index}
              date={dateCopy}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              isInRange={isInRange}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd}
              booking={booking}
              onDateClick={onDateClick}
              onDateMouseEnter={onDateMouseEnter}
              onDateMouseDown={onDateMouseDown}
            />
          );
        })}
      </div>
    </div>
  );
};
