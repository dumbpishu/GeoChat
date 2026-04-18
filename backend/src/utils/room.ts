import ngeohash from "ngeohash";

export const getRoom = (latitude: number, longitude: number, precision: number = 4): string => {
    return ngeohash.encode(latitude, longitude, precision);
}