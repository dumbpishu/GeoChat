import { api } from "@/lib/axios";

type LocationData = {
  lat: number;
  long: number;
  city?: string;
  country?: string;
};

export const getLocationByIpApi = async (): Promise<LocationData> => {
  try {
    const response = await api.get("/api/locations/ip");
    return response.data?.data;
  } catch (error: any) {
    console.error("Failed to get location:", error);
    throw new Error(error.response?.data?.message || "Failed to get location");
  }
};