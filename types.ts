
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  isActive: boolean;
}

export interface CompanyInfo {
  name: string;
  jobTitle: string;
  description: string;
  guidelines: string[];
}

export interface BookingDetails {
  candidateName: string;
  email: string;
  phoneNumber: string;
  slotId: string;
}

export enum AppStep {
  WELCOME = 'WELCOME',
  SELECTION = 'SELECTION',
  CONFIRMATION = 'CONFIRMATION',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN'
}
