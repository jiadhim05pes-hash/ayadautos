// Shared inventory data module.
// SHAPE NOTE: This module exports the typed data the UI consumes today.
// Phase 2 will swap the implementation to a Supabase-backed createServerFn
// without changing the public API consumed by routes.

export type VehicleCategory = 'SUV' | 'Sedan' | 'Luxury' | 'Family Car' | 'Hatchback';
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
}

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028859419/9K8v2QKzPgfwmAPwCoRoTy';

export const vehicles: Vehicle[] = [
  { id: 'prado-txl-2021', name: 'Toyota Land Cruiser Prado TXL', make: 'Toyota', model: 'Land Cruiser Prado TXL', year: 2021, priceKes: 5_980_000, category: 'SUV', fuel: 'Diesel', transmission: 'Automatic', mileageKm: 45000, registration: 'Fresh Import', featured: true, image: `${CDN}/inventory-prado-txl-J926trurJPgWepBWT3waeQ.webp` },
  { id: 'mazda-cx5-2020', name: 'Mazda CX-5', make: 'Mazda', model: 'CX-5', year: 2020, priceKes: 3_105_000, category: 'SUV', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 32000, registration: 'New Registration', featured: true, image: `${CDN}/inventory-mazda-cx5-5XJ2bpkXvHJw22npDfK4Nx.webp` },
  { id: 'rav4-2019', name: 'Toyota RAV4', make: 'Toyota', model: 'RAV4', year: 2019, priceKes: 2_817_500, category: 'Family Car', fuel: 'Hybrid', transmission: 'Automatic', mileageKm: 28000, registration: 'Fresh Import', featured: true, image: `${CDN}/inventory-rav4-YSGzRmKMuAvGT8JN298tap.webp` },
  { id: 'lexus-rx-2022', name: 'Lexus RX', make: 'Lexus', model: 'RX', year: 2022, priceKes: 5_520_000, category: 'Luxury', fuel: 'Hybrid', transmission: 'Automatic', mileageKm: 38000, registration: 'New Registration', featured: true, image: `${CDN}/inventory-lexus-rx-URdhhHbTKXHNEignCpmRxF.webp` },
  { id: 'mercedes-gle-2021', name: 'Mercedes-Benz GLE', make: 'Mercedes-Benz', model: 'GLE', year: 2021, priceKes: 7_475_000, category: 'Luxury', fuel: 'Diesel', transmission: 'Automatic', mileageKm: 42000, registration: 'Fresh Import', featured: true, image: `${CDN}/inventory-mercedes-gle-MsmxuT3TBBH3QvBRLSGknc.webp` },
  { id: 'camry-2020', name: 'Toyota Camry', make: 'Toyota', model: 'Camry', year: 2020, priceKes: 2_472_500, category: 'Sedan', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 25000, registration: 'New Registration', featured: true, image: `${CDN}/inventory-camry-N6ZNm3KUZv4PmTjusccb8Y.webp` },
  { id: 'subaru-outback-2019', name: 'Subaru Outback', make: 'Subaru', model: 'Outback', year: 2019, priceKes: 2_415_000, category: 'SUV', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 35000, registration: 'Fresh Import', featured: false, image: `${CDN}/inventory-subaru-outback-jgrzoXJ87iCVdc9Q4cauvD.webp` },
  { id: 'honda-crv-2020', name: 'Honda CR-V', make: 'Honda', model: 'CR-V', year: 2020, priceKes: 1_840_000, category: 'SUV', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 30000, registration: 'New Registration', featured: false, image: `${CDN}/inventory-honda-crv-RBVLMgo8MtXRWgHSopVY28.webp` },
  { id: 'toyota-vitz-2018', name: 'Toyota Vitz', make: 'Toyota', model: 'Vitz', year: 2018, priceKes: 977_500, category: 'Hatchback', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 22000, registration: 'Fresh Import', featured: false, image: `${CDN}/inventory-toyota-vitz-RVzamEuQj8rMepe4238MPY.webp` },
  { id: 'nissan-xtrail-2021', name: 'Nissan X-Trail', make: 'Nissan', model: 'X-Trail', year: 2021, priceKes: 2_645_000, category: 'SUV', fuel: 'Diesel', transmission: 'Automatic', mileageKm: 40000, registration: 'New Registration', featured: false, image: `${CDN}/inventory-nissan-xtrail-o8XxVLZ84uL7G7o7Wcm6t3.webp` },
  { id: 'bmw-x5-2022', name: 'BMW X5', make: 'BMW', model: 'X5', year: 2022, priceKes: 5_980_000, category: 'Luxury', fuel: 'Diesel', transmission: 'Automatic', mileageKm: 48000, registration: 'Fresh Import', featured: false, image: `${CDN}/inventory-bmw-x5-2022-4neymwHqqbYXYbBjXGmksC.webp` },
  { id: 'hyundai-tucson-2020', name: 'Hyundai Tucson', make: 'Hyundai', model: 'Tucson', year: 2020, priceKes: 1_610_000, category: 'SUV', fuel: 'Petrol', transmission: 'Automatic', mileageKm: 28000, registration: 'New Registration', featured: false, image: `${CDN}/inventory-hyundai-tucson-2020-hU7gJYjot5GvL6j29jQzvA.webp` },
];

export const featuredVehicles = (limit = 6) => vehicles.filter(v => v.featured).slice(0, limit);

export const formatKes = (n: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

export const WHATSAPP_NUMBER = '254768487356';
export const PHONE_DISPLAY = '+254 768 487 356';
export const LOCATION_DISPLAY = 'Ngong Road, Nairobi, Kenya';

export const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
