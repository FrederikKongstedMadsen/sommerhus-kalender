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
    if (booking.type === "wish") {
      // Wishes use a lighter, dashed style
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
    } else {
      // Use selected color or fall back to hash-based color
      if (booking.color) {
        const colorMap: Record<string, string> = {
          blue: "bg-blue-200",
          green: "bg-green-200",
          yellow: "bg-yellow-200",
          purple: "bg-purple-200",
          pink: "bg-pink-200",
          indigo: "bg-indigo-200",
          orange: "bg-orange-200",
          red: "bg-red-200",
          teal: "bg-teal-200",
        };
        bgColor = colorMap[booking.color] || "bg-blue-200";
      } else {
        // Fall back to hash-based color for backwards compatibility
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
      }
      textColor = "text-gray-900";
    }
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
        ${booking?.type === "wish" ? "border-dashed border-2" : ""}
        select-none
      `}
      onClick={() => onDateClick(date)}
      onMouseEnter={() => onDateMouseEnter(date)}
      onMouseDown={() => onDateMouseDown(date)}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="text-sm font-medium">{dayNumber}</div>
      {booking && (
        <div
          className="text-xs mt-1 truncate"
          title={
            booking.note
              ? `${booking.name}${booking.type === "wish" ? " (Ønske)" : ""}\n${
                  booking.note
                }`
              : booking.name
          }
        >
          {booking.type === "wish" ? "💭 " : ""}
          {booking.name}
        </div>
      )}
    </div>
  );
};
