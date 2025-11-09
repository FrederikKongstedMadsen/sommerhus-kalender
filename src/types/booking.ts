export type BookingType = "booking" | "wish";

export type BookingColor =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo"
  | "orange"
  | "red"
  | "teal";

export interface Booking {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt: string; // ISO date string
  type: BookingType; // "booking" or "wish"
  note?: string; // Optional note
  color?: BookingColor; // Optional color
}

export interface DateRange {
  start: Date;
  end: Date;
}
