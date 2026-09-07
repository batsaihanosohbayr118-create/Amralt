export type LatLng = { lat: number; lng: number };

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const hasGoogleMapsKey = () => GOOGLE_MAPS_API_KEY.length > 0;

export const UB_CENTER = { lat: 47.9184, lng: 106.9177 };

export const MONGOLIA_CENTER = { lat: 46.8625, lng: 103.8467 };
export const MONGOLIA_DEFAULT_ZOOM = 5;
