// Manually-maintained DB row types until types.ts is regenerated.
// Mirrors the migration schema.

export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'draft';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type Transmission = 'Automatic' | 'Manual';
export type Registration = 'Fresh Import' | 'New Registration' | 'Locally Used';
export type LeadStatus = 'new' | 'in_progress' | 'contacted' | 'won' | 'lost' | 'archived';
export type AppRole = 'admin' | 'staff' | 'user';

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface VehicleRow {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price_kes: number;
  category_id: string | null;
  fuel: FuelType;
  transmission: Transmission;
  mileage_km: number;
  registration: Registration;
  description: string | null;
  features: string[];
  primary_image: string | null;
  featured: boolean;
  status: VehicleStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
