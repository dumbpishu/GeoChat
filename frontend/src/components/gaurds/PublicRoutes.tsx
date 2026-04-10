import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

export const PublicRoutes = () => {
    const { user, loading } = useAuth();

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