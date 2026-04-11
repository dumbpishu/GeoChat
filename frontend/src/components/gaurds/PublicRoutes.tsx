import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

export const PublicRoutes = () => {
    const user = useUserStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/chat" replace />;
    }

    return <Outlet />;
}