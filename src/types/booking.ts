export type VehicleType = 'citadine' | 'berline' | 'suv' | 'utilitaire';

export type CleaningObjective = 'entretien' | 'revente' | 'leasing' | 'remise-neuf';

export type VehicleCondition = 'leger' | 'sale' | 'tres-sale';

export type TimePreference = 'flexible' | 'rapide';

export interface BookingAnswers {
  vehicleType?: VehicleType;
  objective?: CleaningObjective;
  condition?: VehicleCondition;
  interior?: boolean;
  exterior?: boolean;
  timePreference?: TimePreference;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  features: string[];
}

export interface TimeSlot {
  id: string;
  date: Date;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  pack: Pack;
  date: Date;
  time: string;
  vehicleType: VehicleType;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}
