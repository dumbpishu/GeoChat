import axios from "axios";
import { ApiError } from "../utils/ApiError";

export const getLocationByIpService = async (ip: string) => {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
            timeout: 5000,
        });

        const data = response.data;

        // Validate API response
        if (!data || data.error) {
            throw new ApiError(400, "Invalid IP or failed to fetch location");
        }

        return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            lat: data.latitude,
            long: data.longitude,
        };
    } catch (error) {
        console.error("IP Location Error:", error);
        throw new ApiError(500, "Failed to fetch location data");
    }
};