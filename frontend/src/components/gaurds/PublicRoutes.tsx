import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";

export const PublicRoutes = () => {
    const user = useUserStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    if (loading) {
        return <Spinner />;
    }

    if (user) {
        return <Navigate to="/chat" replace />;
    }

    return <Outlet />;
}