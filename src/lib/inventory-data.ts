// Inventory helpers.
// Vehicles live in the database (Lovable Cloud). This module now only
// exports formatting/utility helpers + the Vehicle UI shape + a mapper from
// DB rows. Runtime data comes from `useVehicles()` / `useFeaturedVehicles()`.
import { dealership } from '@/config/dealership';
import type { VehicleRow } from '@/lib/db-types';

export type VehicleCategory = 'SUV' | 'Sedan' | 'Luxury' | 'Family Car' | 'Hatchback' | string;
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type Transmission = 'Automatic' | 'Manual';

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  priceKes: number;
  category: VehicleCategory;
  fuel: FuelType;
  transmission: Transmission;
  mileageKm: number;
  registration: 'Fresh Import' | 'New Registration' | 'Locally Used';
  featured: boolean;
  image: string;
  status?: 'available' | 'reserved' | 'sold' | 'draft';
  slug?: string;
}

export const WHATSAPP_NUMBER = dealership.contact.whatsappNumber;
export const PHONE_DISPLAY = dealership.contact.phoneDisplay;
export const LOCATION_DISPLAY = dealership.contact.locationDisplay;

export const formatKes = (n: number) =>
  new Intl.NumberFormat(dealership.currency.locale, {
    style: 'currency',
    currency: dealership.currency.code,
    maximumFractionDigits: 0,
  }).format(n);

export const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

/** Human-friendly showroom stock reference derived from the vehicle UUID. */
export const stockId = (id: string) =>
  `AYD-${id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`;


const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%230b0d12"/><text x="50%" y="50%" text-anchor="middle" fill="%23444" font-family="sans-serif" font-size="28">No image</text></svg>';

export function mapVehicleRow(
  row: VehicleRow,
  categoryName?: string | null,
): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    make: row.make,
    model: row.model,
    year: row.year,
    priceKes: Number(row.price_kes),
    category: (categoryName ?? 'SUV') as VehicleCategory,
    fuel: row.fuel,
    transmission: row.transmission,
    mileageKm: row.mileage_km,
    registration: row.registration,
    featured: row.featured,
    image: row.primary_image || FALLBACK_IMG,
    status: row.status,
  };
}

// Retained (empty) exports so any lingering import doesn't crash SSR.
export const vehicles: Vehicle[] = [];
export const featuredVehicles = (_limit = 6): Vehicle[] => [];
