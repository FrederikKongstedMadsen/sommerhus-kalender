export interface Booking {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface DateRange {
  start: Date;
  end: Date;
}
