// types.ts - Type definitions for the app
export interface Guest {
    id: string;
    name: string;
    phoneNumber: string;
    guestCount: number;
    willingToShare: boolean;
    registeredAt: string; // ISO string
    waitingTime: number; // in minutes
    status: 'waiting' | 'seated' | 'cancelled';
    processedAt?: string; // ISO string when status changes from waiting
  }
  
  export interface DailyStats {
    date: string; // YYYY-MM-DD
    totalGuests: number;
    totalPlates: number;
    guestsServed: Guest[];
  }
  
  export interface AppSettings {
    avgTableTurnaroundTime: number; // in minutes
    totalTables: number;
  }