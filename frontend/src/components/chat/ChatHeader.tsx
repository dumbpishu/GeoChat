import { useLocationStore } from "@/store/location.store";
import { Loader2, MapPin } from "lucide-react";

export const LocationLoading = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-14 sm:w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-2xl shadow-sky-500/20 animate-pulse">
          <MapPin className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-slate-300 font-medium">Getting your location...</p>
          <p className="text-slate-500 text-sm mt-1">This helps connect you with nearby users</p>
        </div>
        <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
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
    <div className="flex flex-col h-screen bg-slate-950 items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-14 sm:w-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-5 border border-slate-700/50">
          <MapPin className="w-7 sm:w-8 h-7 sm:h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Location Unavailable</h3>
        <p className="text-slate-500 text-sm mb-6">
          Could not get your location. Please enable location services or allow browser access.
        </p>
        <button
          onClick={handleRetry}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-sky-500/20 transition-all disabled:opacity-50"
        >
          {loading ? "Trying..." : "Try Again"}
        </button>
      </div>
    </div>
  );
};