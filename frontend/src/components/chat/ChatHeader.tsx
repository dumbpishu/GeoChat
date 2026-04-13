import { useLocationStore } from "@/store/location.store";
import { Loader2, MapPin } from "lucide-react";

export const LocationLoading = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 items-center justify-center">
      <div className="flex flex-col items-center gap-6 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg shadow-sky-500/10">
        <div className="w-14 sm:w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <MapPin className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-semibold text-lg">Finding your neighborhood</p>
          <p className="text-slate-500 text-sm mt-2">Locating people around you to start chatting</p>
        </div>
        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
      </div>
    </div>
  );
};

export const LocationError = ({ onRetry }: { onRetry: () => void }) => {
  const { fetchLocation, loading } = useLocationStore();

  const handleRetry = () => {
    fetchLocation();
    onRetry();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 items-center justify-center p-6">
      <div className="text-center max-w-sm p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg shadow-sky-500/10">
        <div className="w-14 sm:w-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-5 border border-sky-100">
          <MapPin className="w-7 sm:w-8 h-7 sm:h-8 text-sky-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Enable Location Access</h3>
        <p className="text-slate-500 text-sm mb-6">
          GeoChat needs your location to connect you with people in your area. Please enable location access in your browser settings.
        </p>
        <button
          onClick={handleRetry}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-sky-500/20 transition-all disabled:opacity-50"
        >
          {loading ? "Finding..." : "Try Again"}
        </button>
      </div>
    </div>
  );
};