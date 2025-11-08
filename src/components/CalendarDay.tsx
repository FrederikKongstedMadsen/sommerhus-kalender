import type { Booking } from "../types/booking";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  booking?: Booking;
  onDateClick: (date: Date) => void;
  onDateMouseEnter: (date: Date) => void;
  onDateMouseDown: (date: Date) => void;
}

export const CalendarDay = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isInRange,
  isRangeStart,
  isRangeEnd,
  booking,
  onDateClick,
  onDateMouseEnter,
  onDateMouseDown,
}: CalendarDayProps) => {
  const dayNumber = date.getDate();

  // Determine the background color based on state
  let bgColor = "";
  let textColor = "text-gray-900";

  if (booking) {
    // Use a color based on booking name hash for consistency
    const colors = [
      "bg-blue-200",
      "bg-green-200",
      "bg-yellow-200",
      "bg-purple-200",
      "bg-pink-200",
      "bg-indigo-200",
      "bg-orange-200",
    ];
    const hash = booking.name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    bgColor = colors[hash % colors.length];
    textColor = "text-gray-900";
  } else if (isSelected || isRangeStart || isRangeEnd) {
    bgColor = "bg-blue-500";
    textColor = "text-white";
  } else if (isInRange) {
    bgColor = "bg-blue-200";
    textColor = "text-gray-900";
  } else if (!isCurrentMonth) {
    bgColor = "bg-gray-100";
    textColor = "text-gray-400";
  } else {
    bgColor = "bg-white";
    textColor = "text-gray-900";
  }

  const borderClasses =
    isToday && !booking && !isSelected ? "ring-2 ring-blue-400" : "";

  return (
    <div
      className={`
        ${bgColor}
        ${textColor}
        ${borderClasses}
        min-h-[80px] p-2 border border-gray-200 cursor-pointer
        hover:bg-opacity-80 transition-colors
        ${!isCurrentMonth ? "opacity-50" : ""}
        ${booking ? "font-semibold" : ""}
      `}
      onClick={() => onDateClick(date)}
      onMouseEnter={() => onDateMouseEnter(date)}
      onMouseDown={() => onDateMouseDown(date)}
    >
      <div className="text-sm font-medium">{dayNumber}</div>
      {booking && (
        <div className="text-xs mt-1 truncate" title={booking.name}>
          {booking.name}
        </div>
      )}
    </div>
  );
};
