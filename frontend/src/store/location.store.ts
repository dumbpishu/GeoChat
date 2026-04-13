import { create } from "zustand";
import { getLocationByIpApi } from "@/api/location.api";

type LocationState = {
  location: { lat: number; long: number; city?: string; country?: string } | null;
  loading: boolean;
  error: string | null;
  isLocationAllowed: boolean;

  fetchLocation: () => Promise<void>;
  setLocation: (location: { lat: number; long: number }) => void;
  setLocationAllowed: (allowed: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  loading: false,
  error: null,
  isLocationAllowed: false,

  fetchLocation: async () => {
    set({ loading: true, error: null });

    const tryBrowserLocation = (): Promise<{ lat: number; long: number } | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              long: position.coords.longitude,
            });
          },
          () => resolve(null),
          { timeout: 5000, maximumAge: 300000 }
        );
      });
    };

    try {
      const browserLocation = await tryBrowserLocation();

      if (browserLocation) {
        set({ location: browserLocation, loading: false, isLocationAllowed: true });
        return;
      }

      const ipLocation = await getLocationByIpApi();
      set({ location: ipLocation, loading: false, isLocationAllowed: true });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setLocation: (location) => {
    set({ location, isLocationAllowed: true });
  },

  setLocationAllowed: (allowed) => {
    set({ isLocationAllowed: allowed });
  },
}));