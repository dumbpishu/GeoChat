import { Outlet } from "react-router-dom";

export const ChatLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
            <Outlet />
        </div>
    );
};