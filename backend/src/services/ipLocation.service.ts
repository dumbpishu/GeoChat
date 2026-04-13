import axios from "axios";
import { ApiError } from "../utils/ApiError";

export const getLocationByIpService = async (ip: string) => {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        
        return {
            ip: response.data.ip,
            city: response.data.city,
            region: response.data.region,
            country: response.data.country_name,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
        }
    } catch (error) {
        throw new ApiError(500, "Failed to fetch location data");
    }
}