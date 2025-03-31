// export enum StatusTypes {
//   Waiting = "waiting",
//   Seated = "seated",
//   Cancelled = "cancelled",
//   Confirmed = "confirmed",
//   TableReady = "table ready",
// }
// export interface Guest {
//   _id: string;
//   name: string;
//   phoneNumber: string;
//   numberOfGuests: number;
//   willingToShare: boolean;
//   entryTime: string; // ISO string
//   waitingTime: number; // in minutes
//   status: StatusTypes;
//   processedAt?: string; // ISO string when status changes from waiting
// }

// export interface DailyStats {
//   date: string; // YYYY-MM-DD
//   totalGuests: number;
//   totalPlates: number;
//   guestsServed: Guest[];
// }

// export interface AppSettings {
//   avgTableTurnaroundTime: number; // in minutes
//   totalTables: number;
// }
