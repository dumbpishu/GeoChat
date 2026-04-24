import ngeohash from "ngeohash";

export const getRoom = (latitude: number, longitude: number, precision: number = 5): string => {
    return ngeohash.encode(latitude, longitude, precision);
}